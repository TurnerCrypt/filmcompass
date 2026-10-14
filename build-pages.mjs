import {readFile,writeFile} from 'node:fs/promises';
const source=await readFile(new URL('./dist/index.html',import.meta.url),'utf8');
for(const page of ['taste','mood','cast-language'])await writeFile(new URL('./dist/'+page+'.html',import.meta.url),source.replace('data-page="home"','data-page="'+page+'"').replace('<title>FilmCompass — Find your next film</title>','<title>FilmCompass — '+({taste:'Your Taste',mood:'Your Mood','cast-language':'Actor & Language'}[page])+'</title>'));
