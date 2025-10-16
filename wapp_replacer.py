#!/usr/bin/python3
import os


def act(filename):
	s1=''
	
	os.system(f"sed  -z 's|+254757836023|+255752425190|g' {filename} > i2.html")
	os.system(f"mv i2.html {filename}")

	os.system(f"sed  -z 's|+254 757 836 023|+255 752 425 190|g' {filename} > i2.html")
	os.system(f"mv i2.html {filename}")

	
os.chdir("about-us")
act('index.html')
os.chdir('..')

print("Done")

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

files=['contact-us/index.html','contact-us/index2.html','package1/index.html','package1/index2.html','package1/index3.html',
'package2/index.html','package2/index0.html','package2/index1.html','package2/index2.html','package2/index3.html','package3/index.html',
'package4/index.html','package4/index11.html','package5/index.html','package6/index.html','package6/index1.html','package7/index.html','package8/index.html']

files2=[f'routes/index{i}.html' for i in range(1,7)]
for char in files2:files.append(char)

print(files)

'''
for file in files:
	driver1(file)
'''