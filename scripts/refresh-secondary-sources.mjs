import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import './network-fetch.mjs';

const root = process.cwd();
const read = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const date = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai'}).format(new Date());
const now = new Date().toISOString();
const decode = text => text.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
const get = async url => {
  const response = await fetch(url, {signal:AbortSignal.timeout(20000)});
  const html = await response.text();
  return {response,html,title:decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''),hash:createHash('sha256').update(html).digest('hex')};
};
const watchlist = await read('ai-creator-watchlist-2026.json');
const memene = await read('data/dev/memene-daily-latest.json');
const models = await read('model-industry-watchlist.json');
const evidence = [];
for (const channel of watchlist.channels) {
  const check = {name:channel.name,url:channel.url,checkedAt:now,status:'blocked',videos:[]};
  try {
    if (/memene\.cn/.test(channel.url)) {
      if (!memene.target?.id || memene.target.date !== date) {
        check.status = 'stale';
        check.sourceDate = memene.fallback?.date ?? memene.history?.[0]?.date ?? null;
        check.error = 'Optional Memene source has no current record; other sources continue';
        throw new Error(check.error);
      }
      channel.url = `https://memene.cn/daily/${memene.target.id}`;
      channel.url_pattern = 'https://memene.cn/daily/{structured-record-id}';
      check.url = channel.url;
    }
    const {response,html,title,hash} = await get(check.url);
    Object.assign(check,{httpStatus:response.status,title,contentHash:hash});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (/memene\.cn/.test(check.url)) {
      if (!title.includes(date) || /未找到/.test(title)) throw new Error('Memene record date missing');
      Object.assign(check,{status:'success',sourceDate:date,candidates:memene.target.candidates.length});
    } else if (/youtube\.com/.test(check.url)) {
      const channelId = html.match(/"externalId":"(UC[\w-]+)"/)?.[1] ?? html.match(/itemprop="channelId" content="(UC[\w-]+)"/)?.[1];
      if (!channelId) throw new Error('No authoritative channel ID; search URL is not a verified upload feed');
      const feed = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
      if (!feed.response.ok) throw new Error(`YouTube RSS HTTP ${feed.response.status}`);
      const parsed = new XMLParser().parse(feed.html);
      const entries = parsed.feed?.entry ? [parsed.feed.entry].flat() : [];
      if (!entries.length) throw new Error('Upload feed unavailable or empty; not recorded as no new videos');
      check.videos = entries.map(entry=>({id:entry['yt:videoId'],title:entry.title,publishedAt:entry.published,url:`https://www.youtube.com/watch?v=${entry['yt:videoId']}`}))
        .filter(video=>Date.parse(video.publishedAt)>=Date.parse(date+'T00:00:00+08:00')-92*86400000);
      Object.assign(check,{status:'success',channelId,uploadFeedChecked:true,latestPublishedAt:entries[0].published});
    } else if (/huggingface\.co/.test(check.url)) {
      const modelResponse = await fetch('https://huggingface.co/api/models?sort=trendingScore&limit=20', {signal:AbortSignal.timeout(20000)});
      check.apiHttpStatus = modelResponse.status;
      if (!modelResponse.ok) throw new Error(`Model discovery API HTTP ${modelResponse.status}`);
      const discoveries = await modelResponse.json();
      if (!Array.isArray(discoveries) || !discoveries.length) throw new Error('Model discovery response missing');
      check.discoveries = discoveries.map(model=>({modelId:model.id,lastModified:model.lastModified,downloads:model.downloads}));
      check.status='success';
    } else { check.status='partial'; check.error='Page reachable; no structured content date extracted'; }
    if (check.status === 'success') channel.last_seen_at = date;
  } catch (error) { check.error=error.message; }
  channel.last_checked_at=now; channel.collection_status=check.status; channel.collection_note=check.error ?? 'Official structured source checked';
  evidence.push(check);
  console.log(`${channel.name}: ${check.status}${check.httpStatus ? ` HTTP ${check.httpStatus}` : ''}, ${check.videos.length} recent upload candidates`);
}
const config = await read('ai-paper-sources.json');
const conferences = [];
for (const conference of config.conferences) {
  const check = {id:conference.id,url:conference.officialUrl,checkedAt:now,status:'blocked',candidates:[]};
  try {
    let {response,html,title,hash} = await get(check.url);
    Object.assign(check,{httpStatus:response.status,title,contentHash:hash});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    // CVF's landing page lists day selectors, not the papers themselves.
    if (conference.id==='CVPR') {
      const all = html.match(/href="([^"]*day=all[^"]*)"/i)?.[1];
      if (all) { check.listUrl=new URL(all.replace(/&amp;/g,'&'),response.url).href; ({response,html}=await get(check.listUrl)); if(!response.ok) throw new Error(`CVF list HTTP ${response.status}`); }
    }
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)]
      .map(([,href,label])=>({url:new URL(href.replace(/&amp;/g,'&'),response.url).href,title:decode(label)}))
      .filter(link=>/\/html\/|\/forum\?|\/paper_files\/paper\/.*Abstract|\.html$/.test(link.url) && link.title.length>20);
    check.candidates=links.filter(link=>/gaussian|world model|3d|spatial|robot|physics|floor plan|architect|cad|video|agent/i.test(link.title)).slice(0,30)
      .map(link=>({...link,verification:'metadata',venue:conference.id,discoveredAt:now}));
    check.paperLinksObserved=links.length;
    check.status=links.length?'success':'partial';
    if(!links.length) check.error='Official landing page reachable; detailed paper records require further indexed/API collection';
  }catch(error){check.error=error.message;}
  conferences.push(check); console.log(`${conference.id}: ${check.status}, ${check.candidates.length} relevant metadata candidates`);
}
watchlist.updated_at=now; watchlist.last_report_file=`/reports/ai-events-${date}.md`;
const start = new Date(date+'T00:00:00Z'); start.setUTCMonth(start.getUTCMonth()-3);
watchlist.video_window={...watchlist.video_window,from:start.toISOString().slice(0,10),to:date};
await mkdir(resolve(root,'data/dev/source-archives'),{recursive:true});
await writeFile(resolve(root,'ai-creator-watchlist-2026.json'),JSON.stringify(watchlist,null,2)+'\n');
await writeFile(resolve(root,'data/dev/secondary-source-verification.json'),JSON.stringify({runDate:date,checkedAt:now,creators:evidence,conferences,
  modelCardReview:{reviewedAt:models.updatedAt,models:models.models.map(model=>({modelId:model.modelId,reviewedAt:model.reviewedAt}))},
  caveat:'Metadata candidates are not accepted events or new full-text reviews. Blocked discovery feeds retain last_seen_at and are not represented as empty successful sources.'},null,2)+'\n');
