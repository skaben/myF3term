import random 

def loadWords(path, wordLen):    
    wordList = {
        'words': [],
        'count': 0
        }
    with open(path + '/words' + str(wordLen) + '.txt','r') as f:
        for word in f:
            wordList['words'].append(word.strip("\n\t "))
    wordList['count'] = len(wordList['words'])
    return wordList

def genRandomWord (wordList):
    return wordList[random.randint(0, len(wordList) - 1)]
    
def compareWords (wordA, wordB):
    count = 0
    for c in range(len(wordA)):
        if (wordA[c] == wordB[c]):
            count += 1
    return count
    
def sortWordList(words, password):
    sortedDict = {
        'wordListMax': [],
        'wordListZero': [],
        'wordListOther': []
        }
    wordDelta = 2
    wordLen = len(password)
    while len(sortedDict['wordListMax']) == 0:
        i = 0
        for word in words:
            if word != password:
                c = compareWords(word, password)
                if c == 0:
                    sortedDict['wordListZero'].append(word)
                elif c == (wordLen - 1):
                    sortedDict['wordListMax'].append(word)
                elif c == (wordLen - wordDelta):
                    sortedDict['wordListMax'].append(word)
                else:
                    sortedDict['wordListOther'].append(word)
        wordDelta += 1
    return sortedDict
        
def wordsSelect(path, wordLen, wordQuan):
    gameData = {
        'falseWords': []
        }
    sortDict = {}
    wordList = loadWords(path, wordLen)
    pwd = genRandomWord(wordList['words'])
    gameData['password'] = pwd
    sortDict = sortWordList(wordList['words'],pwd)
    if len(sortDict['wordListMax']) > 0:    
        gameData['falseWords'].append(genRandomWord(sortDict['wordListMax']))
    if len(sortDict['wordListZero']) > 0:   
        gameData['falseWords'].append(genRandomWord(sortDict['wordListZero']))
    i = 0
    while i < wordQuan - 3:        
        word = sortDict['wordListOther'][random.randint(0, len(sortDict['wordListOther']) - 1)]
        if word not in gameData['falseWords']:
            gameData['falseWords'].append(word)
            i += 1
    return gameData

gameDat = wordsSelect('dicts', 8, 16)

print(gameDat)
