#!/usr/bin/python3
import os


def act(filename):
	
	os.system(f"sed  -z 's|#ffa993|#811a18|g' {filename} > i2.html")
	os.system(f"mv i2.html {filename}")

	

	
#act("index1.html")

def driver1(filename):

	try:
		act(filename)
		print("modifying file contents...")
	except:
		print("detected folder, modifying file inside it")
		folder,file=filename.split('/')
		os.chdir(folder)
		act(file)
		os.chdir('..')

files=['index.html','index1.html','request-a-quote/index.html','about-us/index.html','contact-us/index.html','contact-us/index2.html','package1/index.html','package1/index2.html','package1/index3.html',
'package2/index.html','package2/index0.html','package2/index1.html','package2/index2.html','package2/index3.html','package3/index.html',
'package4/index.html','package4/index11.html','package5/index.html','package6/index.html','package6/index1.html','package7/index.html','package7/index1.html','package7/index2.html','package7/index3.html','package7/index4.html','package8/index.html',
'bio/emmanueltsikho.html','bio/innocenttesha.html','bio/neemamihale.html','bio/neemammtenga.html','bio/petertarimo.html','bio/ramadhan.html',
'bio/reginaldjoseph.html','bio/saidimartine.html']

files2=[f'routes/index{i}.html' for i in range(1,7)]
for char in files2:files.append(char)

css_dirs=open('css dirs','r').read().split('\n')

for d in css_dirs:files.append(d)



print(files)


