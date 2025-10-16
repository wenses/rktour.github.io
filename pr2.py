#!/usr/bin/python3
import os

def act(filename):

	os.system(f" sed 's|+254 757 836 023|+255 753 425 190|g' {filename} > i1.html")
	os.system(f"mv i1.html {filename}")
	os.system(f"sed 's|+254757836023|+255753425190|g' {filename} > i2.html")
	os.system(f"mv i2.html {filename}")

'''files=['rwanda-safari/index.html','uganda-safari/index.html',
'kenya-safari-by-road/index.html','kenya-safari-by-road/index1.html',
'kenya-safari-by-road/index2.html','kenya-safari-by-road/index3.html',
'kenya-flying-safaris/index.html','kenya-flying-safaris/index2.html',
'kenya-flying-safaris/index3.html','mufasa-fleet/index.html',
'mufasa-videos/index.html','contact-us/index.html',
'tanzania-safaris/index.html','kenya-tanzania-zanzibar-safaris/index.html','mufasa-fleet/index11.html']'''

act('index1.html')