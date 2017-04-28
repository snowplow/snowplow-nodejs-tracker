#!/usr/bin/env python

from contextlib import contextmanager
import os
import sys
import subprocess


if 'TRAVIS_TAG' in os.environ:
    TRAVIS_TAG = os.environ.get('TRAVIS_TAG')
else:
    sys.exit("Environment variable TRAVIS_TAG is unavailable")

if 'NPM_AUTH_TOKEN' in os.environ:
    NPM_AUTH_TOKEN = os.environ.get('NPM_AUTH_TOKEN')
else:
    sys.exit("Environment variable NPM_AUTH_TOKEN is unavailable")

@contextmanager
def npm_credentials():
    """Context manager allowing to use different credentials and delete them after use"""
    npmrc = os.path.expanduser("~/.npmrc")

    if os.path.isfile(npmrc):
        os.remove(npmrc)
        print("WARNING! ~/.npmrc already exists. It should be deleted after each use")
        print("Overrinding existing ~/.npmrc")
    else:
        print("Creating ~/.npmrc")

    with open(npmrc, 'a') as f:
        f.write("registry=http://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=" + NPM_AUTH_TOKEN)

    yield

    print("Deleting ~/.npmrc")
    os.remove(npmrc)


def output_if_error(output):
    """Callback to print stderr and fail deploy if exit status not successful"""
    (stdout, stderr) = output.communicate()
    if output.returncode != 0:
        print("Process has been failed.\n" + stdout)
        sys.exit(stderr)


def execute(command, callback=output_if_error):
    """Execute shell command with optional callback"""
    formatted_command = " ".join(command) if (type(command) == list) else command
    print("Executing [{0}]".format(formatted_command))
    output = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if hasattr(callback, '__call__'):
        return callback(output)
    else:
        return output


def check_version():
    """Fail deploy if tag version doesn't match ./package.json version"""
    get_version = """var fs=require('fs'); fs.readFile('./package.json', 'utf8', function(e,d) { console.log(JSON.parse(d)['version']) });"""

    node_output = execute(['node', '-e', get_version], None)
    print(node_output.stderr.read())
    for line in node_output.stdout.read().split("\n"):
        print(line)
        if line and line != TRAVIS_TAG:
            sys.exit("Version extracted from TRAVIS_TAG [{0}] doesn't conform declared in package.json [{1}]".format(TRAVIS_TAG, line))
        if line == TRAVIS_TAG:
            return

    sys.exit("Cannot find version in core output:\n" + str(node_output))


if __name__ == "__main__":
    check_version()
    with npm_credentials():
        execute(['npm', 'publish'])
