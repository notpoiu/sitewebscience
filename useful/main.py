rawJS = r'let promptReal = "'

with open("prompt.txt","r",encoding="utf-8") as file:
    prompt = file.read()
    file.close()

rawJS += prompt.replace("\n",r"\n").replace('"',r'\"') + r'";'
print("prompt beautified")

with open("beautifiedPrompt.js","w",encoding="utf-8") as file:
    file.write(rawJS)
    file.close()
print("prompt written to file")