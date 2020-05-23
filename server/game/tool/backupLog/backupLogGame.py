import os, sys, zipfile, fnmatch
from datetime import date, timedelta

if __name__ == '__main__':
    input = sys.argv[1]
    output = sys.argv[2]
    name = sys.argv[3].strip()
    
    yesterday = (date.today() - timedelta(1)).strftime('%Y-%m-%d')    
    print ('yesterday ', yesterday)
    folder = yesterday + '_' + name + '_game'
  
    pathZip = os.path.join(output, folder + '.zip')
    if os.path.exists(pathZip):
        os.remove(pathZip)
    
    fZip = zipfile.ZipFile(pathZip, "w", zipfile.ZIP_DEFLATED)
    
    for (dirpathA, dirsA, filesA) in os.walk(input):
        for category in dirsA:
            target = os.path.join(output, category)            
            for (dirpathB, dirsB, filesB) in os.walk(os.path.join(dirpathA, category)):
                for filename in fnmatch.filter(filesB, '*-' + yesterday + '_*'):
                    fZip.write(os.path.join(dirpathB, filename), folder + '/' + category + '/' + filename)
    fZip.close()
