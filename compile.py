#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import datetime
import re

def list_unique(original):
    output = []
    for i in original:
        if not i in output:
            output.append(i)
    return output

def create_get_fileset(base_path):
    r = re.compile("require\(['\"](.+)['\"]\)")
    def func(main_file):
        base = os.path.dirname(os.path.abspath(main_file))

        files = []

        f = open(main_file)
        main_file_content = f.read()
        requires = r.findall(main_file_content)
        for i in range(len(requires)):
            if not requires[i].endswith('.js'):
                requires[i] += '.js'
        for require in requires:
            require_path = os.path.normpath(os.path.join(base, require))
            if require_path.startswith(base_path):
                files.extend(get_fileset(require_path))

        files.append(main_file)
        return files
    return func
get_fileset = None

def get_files(dir):
    print 'search : ', dir

    files = []

    contents = os.listdir(dir)
    file_mains = []
    dirs = []

    for content in contents:
        candidate = os.path.normpath(os.path.join(dir, content))
        if os.path.isdir(candidate):
            dirs.append(candidate)
        elif os.path.splitext(candidate)[1] == '.js':
            file_mains.append(candidate)

    # get_files recursively
    for dir in dirs:
        files.extend(get_files(dir))

    # files
    for file_main in file_mains:
        if file_main not in files:
            print file_main
            print get_fileset(file_main)
            print ''
            files.extend(get_fileset(file_main))

    return list_unique(files)

def main():
    global get_fileset
    base = os.path.dirname(os.path.abspath(__file__))
    src = os.path.normpath(os.path.join(base, './src'))
    get_fileset = create_get_fileset(src)
    files = get_files(src)

    print 'compiling', len(files), 'files'

    bin_src = os.path.normpath(os.path.join(base, './bin/neo.js'))
    output = []
    output.append('"use strict";');
    output.append('/*')
    output.append(' * Neo.js')
    output.append(' * compiled at : ' + datetime.datetime.today().strftime("%Y-%m-%d %H:%M:%S"));
    output.append(' */')
    for file in files:
        file_relpath = os.path.relpath(file, src)
        output.append('// begin : ' + file_relpath)
        f = open(file)
        data = f.read()
        output.append(data)
        f.close()
        output.append('// end : ' + file_relpath)
        output.append('')
    joined = '\r\n'.join(output)

    f = open(bin_src, 'w')
    f.write(joined)
    f.close()

main()
