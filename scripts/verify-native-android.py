import argparse
import json
from pathlib import Path
import re
import subprocess
import time
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser()
parser.add_argument('--adb', default='adb')
parser.add_argument('--serial', required=True)
parser.add_argument('--package', default='com.padelpotato.app')
parser.add_argument('--plan', required=True)
parser.add_argument('--artifacts', default='.audit/native')
parser.add_argument('--result-name', default='android-verification-results.json')
args = parser.parse_args()
artifacts = Path(args.artifacts)
artifacts.mkdir(parents=True, exist_ok=True)


def adb(*command):
    return subprocess.check_output([args.adb, '-s', args.serial, *command])


def nodes():
    adb('shell', 'uiautomator', 'dump', '/sdcard/padel-verification.xml')
    return list(ET.fromstring(adb('shell', 'cat', '/sdcard/padel-verification.xml')).iter('node'))


def matches(node, label):
    return label in (node.get('text'), node.get('content-desc'), node.get('resource-id'))


def find(label):
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        found = [node for node in nodes() if matches(node, label)]
        if found:
            found.sort(key=lambda node: (node.get('class') != 'android.widget.EditText', node.get('clickable') != 'true'))
            return found[0]
        time.sleep(0.2)
    raise AssertionError(f'Native element missing: {label}')


results = []
for index, step in enumerate(json.loads(Path(args.plan).read_text())):
    action = step['action']
    if action == 'tap':
        node = find(step['label'])
        coords = list(map(int, re.findall(r'\d+', node.get('bounds'))))
        adb('shell', 'input', 'tap', str((coords[0] + coords[2]) // 2), str((coords[1] + coords[3]) // 2))
        nodes()
    elif action == 'assert':
        node = find(step['label'])
        for key, expected in step.get('attributes', {}).items():
            assert node.get(key) == expected, f'{step["label"]}: {key} is {node.get(key)}'
    elif action == 'text':
        adb('shell', 'input', 'text', step['value'].replace(' ', '%s'))
        nodes()
    elif action == 'back':
        adb('shell', 'input', 'keyevent', '4')
        nodes()
    elif action == 'swipe':
        adb('shell', 'input', 'swipe', *map(str, step['coordinates']), '500')
        nodes()
    elif action == 'relaunch':
        adb('shell', 'am', 'force-stop', args.package)
        adb('shell', 'am', 'start', '-n', f'{args.package}/.MainActivity')
    elif action == 'screenshot':
        assert not any(node.get('password') == 'true' for node in nodes()), 'Screenshots of credential entry are disabled.'
        destination = artifacts / step['name']
        adb('shell', 'screencap', '-p', '/sdcard/padel-verification.png')
        adb('pull', '/sdcard/padel-verification.png', str(destination))
    else:
        raise ValueError(f'Unknown action: {action}')
    results.append({'step': index + 1, 'action': action, 'label': step.get('label'), 'status': 'PASS'})
    (artifacts / args.result_name).write_text(json.dumps(results, indent=2) + '\n')
    print(f'PASS {index + 1} {action} {step.get("label", "")}', flush=True)
