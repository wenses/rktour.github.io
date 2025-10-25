import os, random, string

l=string.ascii_lowercase

def gen_word(size):
	es=''
	l=string.ascii_lowercase
	for i in range(size):
		es+=random.choice(l)

	return es

try:
	commit_msg=input("Enter commit msg: ")
except:
	commit_msg=random.choice(l)


os.system("git add --all")
os.system(f'git commit -m "{commit_msg}"')
os.system("git push origin master")
os.system("pause")