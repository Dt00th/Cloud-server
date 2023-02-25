import io
from http import HTTPStatus
import enum
import socket
import ctypes
from distutils import extension
from http.server import HTTPServer, BaseHTTPRequestHandler
import os, cgi, html, sys, posixpath
import cgitb; cgitb.enable()
import json, mimetypes, shutil, urllib
try:
    from urllib.parse import unquote
except ImportError:
    from urllib import unquote as stdlib_unquote

    def unquote(string, encoding='utf-8', errors='replace'):
        if isinstance(string, bytes):
            raise TypeError("a bytes-like object is required, not '{}'".format(type(string)))

        return stdlib_unquote(string.encode(encoding).decode(encoding, errors=errors))
try:
    from cStringIO import StringIO
except ImportError:
    try:
        from StringIO import StringIO
    except ImportError:
        from io import StringIO

import urllib.request


MAINPATH = (os.getcwd().replace('/', '//')) + "//"

os.chdir(MAINPATH)

class Server(BaseHTTPRequestHandler):

    def do_GET(self):
        f = self.send_head()
        if f:
            self.copyfile(f, self.wfile)
            f.close()

    def do_HEAD(self):
        f = self.send_head()
        if f:
            f.close()

    def generate_path_html(self, path):
        enc = sys.getfilesystemencoding()
        r = []
        r.append(f'<html>')
        r.append(f'	<head>')
        r.append(f'		<title>Cloud - file visualizer</title>')
        r.append(f'		<link rel="icon" type="image/png" href="main/images/icon.png">')
        r.append(f'		<style>')
        r.append('			iframe {')
        r.append('			  width: 100%;')
        r.append('			  height: 100%;')
        r.append('			  ')
        r.append('			  ')
        r.append('			}')
        r.append(f'		</style>')
        r.append(f'	</head>')
        r.append(f'	<body>')
        r.append(f'		<iframe allowfullscreen margin=center src="/files{self.path}">')
        r.append(f'		</iframe>')
        r.append(f'	</body>')
        r.append(f'</html>')
        r.append(f'')

        encoded= '\n'.join(r).encode(enc, 'surrogateescape')
        f = io.BytesIO()
        f.write(encoded)
        f.seek(0)
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-type", "text/html; charset=%s" % enc)
        self.end_headers()
        return f

    def send_head(self):
        jsonfile = ('%smain//files.json' % MAINPATH)
        files = ('%sfiles//' % MAINPATH)
        with open(jsonfile, "w") as f:
            file_list = []
            for filename in os.listdir(files):
                attribute_list = {'name': filename, 'type': self.guess_type(files + filename)}
                file_list.append(attribute_list)

            open(jsonfile, 'wb').write(bytes(json.dumps(file_list), 'utf-8'))


        path = self.translate_path(self.path)
        f = None
        if os.path.isdir(path):
                print(path + "/files/" + self.path)
                if not self.path.endswith('/'):
                    self.send_response(301)
                    self.send_header("Location", self.path + "/")
                    self.end_headers()
                    return None
                for index in "main/main.html", "main/main.html":
                    index = os.path.join(path, index)
                    if os.path.exists(index):
                        path = index
                        break;
        else:
             if os.path.isfile(path.replace(self.path, "/files" + self.path)):
                 if os.path.isdir(path.replace(self.path, "")):
                     f = self.generate_path_html(path)
                     return f


        ctype = self.guess_type(path)
        if ctype.rsplit('/')[1] != "html":
            ctype = ctype.rsplit('/')[0] + '/' + self.path.rsplit('.')[len(self.path.rsplit('.'))-1]
            if ctype.rsplit('/')[0] == "video":
                ctype = ctype.rsplit('/')[0] + '/mp4'

        print(ctype)
        try:
            f = open(path, 'rb')
        except IOError:
            self.send_error(404, "File not found")
            return None
        self.send_response(200)
        self.send_header("Content-type", ctype)
        fs = os.fstat(f.fileno())
        self.send_header("Content-Length", str(fs[6]))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.end_headers()

        return f

    def translate_path(self, path):
        path = path.split('?', 1)[0]
        path = path.split('#', 1)[0]
        path = posixpath.normpath((path))
        words = path.split('/')
        words = filter(None, words)
        path = os.getcwd()
        for word in words:
            drive, word = os.path.splitdrive(word)
            head, word = os.path.split(word)
            if word in (os.curdir, os.pardir): continue
            path = os.path.join(path, word)
        return path

    def copyfile(self, source, outputfile):
        if isinstance(source, StringIO):
        	#print("StringIO")
        	source = bytes(str(source), 'utf-8')
        	outputfile.write(source)
        else:
        	#print("main")
        	shutil.copyfileobj(source, outputfile)

    def guess_type(self, path):
        base, ext = posixpath.splitext(path)
        if ext in self.extensions_map:
            return self.extensions_map[ext]
        ext = (ext)
        if ext in self.extensions_map:
            return self.extensions_map[ext]
        else:
            return self.extensions_map['']

    def do_POST(self):
       content_type = self.headers['Content-Type']
       if content_type.startswith('multipart/form-data'):
           # extract file data from request
           form = cgi.FieldStorage(
               fp=self.rfile,
               headers=self.headers,
               environ={'REQUEST_METHOD': 'POST'}
           )
           file_item = form['file']
           file_name = file_item.filename
           file_data = file_item.file.read()

           # save file to server's file system
           with open("files/" + file_name, 'wb') as f:
               f.write(file_data)

           # send response
           self.send_response(200)
           self.end_headers()

       # handle other types of POST requests
       else:
           # extract data from request
           content_length = int(self.headers['Content-Length'])
           request_data = self.rfile.read(content_length)

           # handle request data
           # ...

    def do_PATCH(self):
        print(self.server)
        self.send_response(200)

    def do_DELETE(self):
        ctype, pdict = cgi.parse_header(self.headers.get('content-type'))
        if ctype == 'multipart/form-data':
            form = cgi.FieldStorage( fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD':'DELETE', 'CONTENT_TYPE':self.headers['Content-Type'], })
            filename = form['name']
            if filename:
                os.remove("files/%s"%filename, dir_fd = None)

        self.do_GET()

    def do_PUT(self):
        print(self.address_string)
        self.send_response(200)

    if not mimetypes.inited:
        mimetypes.init()
    extensions_map = mimetypes.types_map.copy()
    extensions_map.update({
        '': 'application/octet-stream', # Default
        '.py': 'text/plain',
        '.c': 'text/plain',
        '.h': 'text/plain',
    })


def main():
    print('Enter port: ')
    PORT = int(input())
    PRIVATE_ADDRESS = socket.gethostbyname(socket.gethostname() + ".local")
    PUBLIC_ADDRESS = urllib.request.urlopen('https://ifconfig.me').read().decode('utf8')

    server = HTTPServer((PRIVATE_ADDRESS, PORT), Server)
    print('Server is running on ' + PRIVATE_ADDRESS + ':%s' % PORT + ' (LAN) | ' + PUBLIC_ADDRESS + ':%s' % PORT + ' (WAN)')

    server.serve_forever()

    #sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    #host = socket.gethostname()
    #sock.bind((host, PORT))
    #sock.listen(1)
    #conn, addr = sock.accept()

if __name__ == '__main__':
    main()
