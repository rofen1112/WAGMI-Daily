import {readFile,writeFile} from 'node:fs/promises';
const base='data/dev/source-archives/audit-0900-2026-11-01/';
const sources=[
 'https://xplore.ai/rwe-bench',
 'https://github.com/google-research/CLASHarness',
 'https://arxiv.org/abs/2610.19128',
 'https://github.com/molence/Mol-1',
 'https://docs.x.ai/developers/advanced-api-usage/watermarking',
 'https://publish.twitter.com/oembed?omit_script=1&url=https%3A%2F%2Fx.com%2Ftypesafeai%2Fstatus%2F2114891173219500237'
];
await writeFile(base+'primary-urls.json',JSON.stringify(sources,null,2)+'\n');
for(const i of [0,1,4]){
 const post=JSON.parse(await readFile(base+'extra-'+i+'.raw','utf8'));
 console.log(JSON.stringify({i,date:post.date,title:post.title?.rendered,links:[...post.content.rendered.matchAll(/href=["']([^"']+)/g)].map(m=>m[1])}));
}
