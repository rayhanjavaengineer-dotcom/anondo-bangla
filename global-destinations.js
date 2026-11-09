/* Anondo Bangla — curated global destination catalogue + worldwide wishlist and trip planner.
   Editorial starter catalogue only; seasonal notes are broad guidance, not guarantees. */
(function(){"use strict";
const $=id=>document.getElementById(id),KEY="ab_global_destination_wishlist_v1",TRIP="ab_global_trip_plan_v1";
const destinations=[
{n:"Tokyo",c:"Japan",r:"Asia",t:"City & culture",s:"March–May; October–November",d:"Modern city life, historic temples, food districts and efficient public transport."},
{n:"Kyoto",c:"Japan",r:"Asia",t:"Culture & heritage",s:"March–May; October–November",d:"Historic streets, gardens, shrines and traditional architecture."},
{n:"Osaka",c:"Japan",r:"Asia",t:"Food & city",s:"March–May; October–November",d:"Known for street food, lively neighbourhoods and day trips."},
{n:"Seoul",c:"South Korea",r:"Asia",t:"City & culture",s:"April–May; September–October",d:"Palaces, markets, contemporary culture and mountain walks."},
{n:"Bangkok",c:"Thailand",r:"Asia",t:"City & food",s:"November–February",d:"Temples, river journeys, markets and varied Thai cuisine."},
{n:"Bali",c:"Indonesia",r:"Asia",t:"Island & nature",s:"April–October",d:"Coastlines, rice terraces, temples and outdoor activities."},
{n:"Singapore",c:"Singapore",r:"Asia",t:"City & family",s:"Year-round; expect tropical showers",d:"Gardens, waterfront attractions, diverse food and public transport."},
{n:"Kuala Lumpur",c:"Malaysia",r:"Asia",t:"City & food",s:"May–July; December–February",d:"Urban landmarks, cultural districts and easy regional connections."},
{n:"Dubai",c:"United Arab Emirates",r:"Asia",t:"City & desert",s:"November–March",d:"Architecture, museums, desert experiences and shopping."},
{n:"Istanbul",c:"Türkiye",r:"Europe / Asia",t:"History & city",s:"April–May; September–October",d:"Historic districts, waterfronts, bazaars and layered heritage."},
{n:"Paris",c:"France",r:"Europe",t:"Art & culture",s:"April–June; September–October",d:"Museums, architecture, gardens, cafés and walkable neighbourhoods."},
{n:"Rome",c:"Italy",r:"Europe",t:"History & food",s:"April–May; September–October",d:"Ancient sites, churches, piazzas and Italian food culture."},
{n:"Barcelona",c:"Spain",r:"Europe",t:"Architecture & coast",s:"April–June; September–October",d:"Distinctive architecture, markets, beaches and neighbourhood life."},
{n:"Swiss Alps",c:"Switzerland",r:"Europe",t:"Mountain & nature",s:"June–September hiking; December–March snow",d:"Mountain scenery, rail journeys and seasonal outdoor activities."},
{n:"Reykjavik",c:"Iceland",r:"Europe",t:"Nature & adventure",s:"June–August; September–March for aurora opportunities",d:"A base for waterfalls, geothermal areas and dramatic landscapes."},
{n:"London",c:"United Kingdom",r:"Europe",t:"City & museums",s:"May–September",d:"Museums, theatre, royal heritage, parks and diverse neighbourhoods."},
{n:"New York City",c:"United States",r:"North America",t:"City & culture",s:"April–June; September–October",d:"Museums, skyline views, parks, food and cultural districts."},
{n:"Grand Canyon",c:"United States",r:"North America",t:"National park",s:"March–May; September–November",d:"Vast canyon landscapes; plan routes and heed park safety guidance."},
{n:"Banff National Park",c:"Canada",r:"North America",t:"Mountain & nature",s:"June–September; December–March",d:"Alpine lakes, mountain trails and winter activities."},
{n:"Vancouver",c:"Canada",r:"North America",t:"City & nature",s:"June–September",d:"Coastal city, parks, mountain views and outdoor recreation."},
{n:"Mexico City",c:"Mexico",r:"North America",t:"Culture & food",s:"March–May; November",d:"Museums, historic districts, markets and renowned cuisine."},
{n:"Rio de Janeiro",c:"Brazil",r:"South America",t:"Coast & city",s:"May–October",d:"Beaches, mountain viewpoints, music and urban culture."},
{n:"Machu Picchu",c:"Peru",r:"South America",t:"Heritage & nature",s:"May–September",d:"Andean archaeological site; entry and circuit rules require advance checking."},
{n:"Cape Town",c:"South Africa",r:"Africa",t:"Coast & nature",s:"November–March",d:"Coastal scenery, mountain viewpoints, gardens and cultural sites."},
{n:"Marrakech",c:"Morocco",r:"Africa",t:"Culture & heritage",s:"March–May; September–November",d:"Historic medina, gardens, architecture and markets."},
{n:"Serengeti National Park",c:"Tanzania",r:"Africa",t:"Wildlife & nature",s:"Varies by wildlife movement; check park guidance",d:"Wildlife viewing in a major protected ecosystem; use licensed operators."},
{n:"Sydney",c:"Australia",r:"Oceania",t:"City & coast",s:"September–November; March–May",d:"Harbour landmarks, coastal walks, beaches and cultural venues."},
{n:"Great Barrier Reef",c:"Australia",r:"Oceania",t:"Marine & nature",s:"June–October often favoured; local conditions vary",d:"Reef experiences with responsible operators and marine protection guidance."},
{n:"Queenstown",c:"New Zealand",r:"Oceania",t:"Adventure & nature",s:"December–February; June–August",d:"Lake and mountain scenery with seasonal adventure activities."},
{n:"Auckland",c:"New Zealand",r:"Oceania",t:"City & coast",s:"December–March",d:"Harbour, volcanic landscapes, island day trips and food."}
];
let saved=load(KEY,[]);
function load(k,f){try{const v=JSON.parse(localStorage.getItem(k)||"null");return Array.isArray(v)?v:f}catch(e){return f}}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){status("ডিভাইসের storage পূর্ণ—কিছু জায়গা সংরক্ষণ করা যায়নি।");return false}}
function status(t){if(typeof window.setStatus==="function")window.setStatus(t)}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){const host=$("curatedDestinationResults");if(!host)return;const q=($("curatedDestinationSearch")?.value||"").trim().toLowerCase(),region=$("curatedDestinationRegion")?.value||"all",type=$("curatedDestinationType")?.value||"all";const rows=destinations.filter(x=>(!q||(x.n+" "+x.c+" "+x.d+" "+x.t).toLowerCase().includes(q))&&(region==="all"||x.r.split(" / ").includes(region))&&(type==="all"||x.t.toLowerCase().includes(type)));host.innerHTML=rows.map(x=>{const id=x.n+"|"+x.c,yes=saved.includes(id),map="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x.n+", "+x.c);return '<article class="destination-card"><div class="destination-card-top"><span>'+esc(x.r)+'</span><span>'+esc(x.t)+'</span></div><h4>'+esc(x.n)+'</h4><strong>'+esc(x.c)+'</strong><p>'+esc(x.d)+'</p><small><b>Suggested season:</b> '+esc(x.s)+'</small><div class="destination-card-actions"><button type="button" data-dest-save="'+esc(id)+'">'+(yes?"✓ Saved":"＋ Save")+'</button><a href="'+map+'" target="_blank" rel="noopener noreferrer">Open map ↗</a></div></article>'}).join("")||'<p class="tool-empty">এই filter-এ কোনো destination পাওয়া যায়নি।</p>';const count=$("destinationCatalogueCount");if(count)count.textContent=rows.length+" destinations · Editorial starter catalogue";renderSaved();}
function renderSaved(){const host=$("globalDestinationWishlist");if(!host)return;host.innerHTML=saved.length?saved.map(id=>{const [n,c]=id.split("|");return '<div class="journal-item"><span><strong>'+esc(n)+'</strong><small>'+esc(c)+'</small></span><button type="button" data-dest-remove="'+esc(id)+'">Remove</button></div>'}).join(""):'<p class="tool-empty">আপনার global destination wishlist খালি।</p>';}
function bind(){["curatedDestinationSearch","curatedDestinationRegion","curatedDestinationType"].forEach(id=>$(id)?.addEventListener(id.endsWith("Search")?"input":"change",render));$("curatedDestinationResults")?.addEventListener("click",e=>{const b=e.target.closest("[data-dest-save]");if(!b)return;const id=b.dataset.destSave;if(saved.includes(id))saved=saved.filter(x=>x!==id);else saved.push(id);if(store(KEY,saved))render();});$("globalDestinationWishlist")?.addEventListener("click",e=>{const b=e.target.closest("[data-dest-remove]");if(!b)return;saved=saved.filter(x=>x!==b.dataset.destRemove);store(KEY,saved);renderSaved();});
 const trip=load(TRIP,{});["worldTripDestination","worldTripStart","worldTripEnd","worldTripPeople","worldTripNotes"].forEach(id=>{if($(id)&&trip[id]!==undefined)$(id).value=trip[id]});$("saveWorldTrip")?.addEventListener("click",()=>{const data={};["worldTripDestination","worldTripStart","worldTripEnd","worldTripPeople","worldTripNotes"].forEach(id=>data[id]=$(id)?.value||"");if(!data.worldTripDestination.trim())return status("গন্তব্য লিখুন।");if(data.worldTripStart&&data.worldTripEnd&&data.worldTripEnd<data.worldTripStart)return status("ফেরার তারিখ যাত্রার তারিখের আগে হতে পারে না।");if(!store(TRIP,data))return;const out=$("worldTripSummary");if(out)out.innerHTML='<strong>'+esc(data.worldTripDestination)+'</strong><p>'+esc(data.worldTripStart||"তারিখ নির্ধারিত নয়")+' → '+esc(data.worldTripEnd||"তারিখ নির্ধারিত নয়")+' · '+esc(data.worldTripPeople||"1")+' traveller(s)</p><small>'+esc(data.worldTripNotes||"কোনো নোট নেই")+'</small>';status("Global trip plan সংরক্ষিত হয়েছে ✓");});if($("worldTripSummary")&&trip.worldTripDestination)$("saveWorldTrip")?.click();
 }
window.AnondoGlobalDestinations={exportData:()=>({wishlist:saved,trip:load(TRIP,{})}),importData:x=>{if(Array.isArray(x?.wishlist))saved=x.wishlist.filter(v=>typeof v==="string"&&v.length<180);store(KEY,saved);if(x?.trip&&typeof x.trip==="object"&&!Array.isArray(x.trip))store(TRIP,x.trip);render();},clear:()=>{saved=[];localStorage.removeItem(KEY);localStorage.removeItem(TRIP);render();}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{bind();render()});else{bind();render();}
})();
