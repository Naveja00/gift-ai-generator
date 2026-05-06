import { useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buildAmazonLink, BUDGETS, OCCASIONS, RANK_BADGES, TONES } from './lib';

const fakeInvoke = async (payload) => ({
  title: `${payload.occasion} Gifts for ${payload.recipient}`,
  summary_for_user: `A warm, refined set of ideas balancing ${payload.tone.toLowerCase()} style and ${payload.interests}.`,
  gift_ideas: Array.from({ length: 5 }).map((_, i) => ({ rank: i + 1, gift_name: `${payload.tone} Pick ${i + 1}`, reasoning: `Curated for ${payload.recipient} and ${payload.occasion}.`, style_match: `This feels ${payload.tone.toLowerCase()} and personal.`, amazon_search_query: `${payload.interests} gift ${payload.budget}` }))
});

const getStore = () => JSON.parse(localStorage.getItem('gift_lists') || '[]');
const saveStore = (lists) => localStorage.setItem('gift_lists', JSON.stringify(lists));

function Layout({ children }) {
  return <div className="min-h-screen bg-cream text-zinc-800"><nav className="sticky top-0 z-30 border-b bg-cream/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between p-4"><Link to="/" className="flex items-center gap-2 font-serif text-2xl text-terracotta"><Gift /> GiftCurator</Link><Link to="/saved" className="text-sm font-medium">Saved Lists</Link></div></nav>{children}</div>;
}

function Home() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ occasion: OCCASIONS[0], recipient: '', interests: '', budget: BUDGETS[1], tone: TONES[0] });
  const [result, setResult] = useState(null);
  const mutation = useMutation({ mutationFn: fakeInvoke, onSuccess: (data) => setResult({ ...form, ...data, gifts: data.gift_ideas.map((g) => ({ ...g, link: buildAmazonLink(g.amazon_search_query) })) }) });

  const steps = ['Understanding recipient','Mapping taste profile','Sourcing thoughtful options','Polishing curated list'];
  return <Layout><main className="mx-auto max-w-6xl p-4 md:p-8"><section className="rounded-3xl bg-white p-8 shadow-sm"><h1 className="font-serif text-5xl italic text-terracotta">Curate unforgettable gifts with AI.</h1><p className="mt-3 max-w-2xl">Luxury gift-shop warmth, powered by intelligent personalization.</p><form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={(e)=>{e.preventDefault();mutation.mutate(form);}}>
    <Select label="Occasion" value={form.occasion} onChange={(occasion)=>setForm({...form,occasion})} options={OCCASIONS}/>
    <Input label="Recipient" value={form.recipient} onChange={(recipient)=>setForm({...form,recipient})}/>
    <TextArea label="Their Interests" value={form.interests} onChange={(interests)=>setForm({...form,interests})}/>
    <Select label="Budget Range" value={form.budget} onChange={(budget)=>setForm({...form,budget})} options={BUDGETS}/>
    <Select label="Gift Tone" value={form.tone} onChange={(tone)=>setForm({...form,tone})} options={TONES}/>
    <button className="md:col-span-2 rounded-xl bg-terracotta py-3 text-white">Generate Curated Gifts</button></form>
    {mutation.isPending && <div className="mt-6 space-y-2">{steps.map((s,i)=><motion.div key={s} initial={{opacity:0.3}} animate={{opacity:[0.3,1,0.3]}} transition={{duration:1.2, repeat:Infinity, delay:i*0.3}}>{i+1}. {s}</motion.div>)}</div>}
    </section>
    <AnimatePresence>{result && <Results result={result} onSave={()=>{const lists=getStore();saveStore([result,...lists]);qc.invalidateQueries({queryKey:['saved']});}} />}</AnimatePresence>
  </main></Layout>;
}

function Results({ result, onSave }) { return <motion.section initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="mt-8"><h2 className="font-serif text-4xl text-terracotta">{result.title}</h2><p className="mt-2">{result.summary_for_user}</p><div className="mt-6 grid gap-4 md:grid-cols-2">{result.gifts.map((g,idx)=><motion.article key={idx} className={`rounded-2xl bg-white p-5 shadow-sm ${idx===0?'md:col-span-2':''}`}><div className="mb-2 inline-block rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-terracotta">{RANK_BADGES[idx]}</div><h3 className="font-serif text-2xl">{g.gift_name}</h3><p className="mt-2 text-sm">{g.reasoning}</p><p className="mt-2 italic">“{g.style_match}”</p><a href={g.link} target="_blank" className="mt-4 inline-flex rounded-lg bg-terracotta px-4 py-2 text-sm text-white">Shop on Amazon</a></motion.article>)}</div><div className="mt-6 flex gap-3"><Link to="/" className="rounded-lg border px-4 py-2">New Search</Link><button onClick={onSave} className="rounded-lg bg-zinc-900 px-4 py-2 text-white">Save This List</button></div></motion.section>;}

function Saved() {
  const qc = useQueryClient();
  const { data=[] } = useQuery({ queryKey:['saved'], queryFn: async()=>getStore() });
  const [active,setActive]=useState(null);
  const del = (i)=>{const next=[...data];next.splice(i,1);saveStore(next);qc.invalidateQueries({queryKey:['saved']});};
  return <Layout><main className="mx-auto max-w-6xl p-6">{active ? <Results result={active} onSave={()=>{}}/> : <div className="grid gap-4 md:grid-cols-2">{data.map((list,i)=><button key={i} onClick={()=>setActive(list)} className="rounded-2xl bg-white p-5 text-left shadow-sm"><div className="flex items-start justify-between"><div><div className="font-serif text-2xl">{list.occasion}</div><div>{list.recipient}</div><span className="mt-2 inline-block rounded-full bg-gold/20 px-2 py-1 text-xs">{list.budget}</span></div><span onClick={(e)=>{e.stopPropagation();del(i);}}><Trash2 className="text-red-500"/></span></div></button>)}</div>}</main></Layout>;
}

const Select=({label,value,onChange,options})=><label className="text-sm">{label}<select className="mt-1 w-full rounded-xl border p-2" value={value} onChange={(e)=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>;
const Input=({label,value,onChange})=><label className="text-sm">{label}<input className="mt-1 w-full rounded-xl border p-2" value={value} onChange={(e)=>onChange(e.target.value)} /></label>;
const TextArea=({label,value,onChange})=><label className="text-sm md:col-span-2">{label}<textarea className="mt-1 w-full rounded-xl border p-2" rows={3} value={value} onChange={(e)=>onChange(e.target.value)} /></label>;

export default function App(){return <Routes><Route path="/" element={<Home/>} /><Route path="/saved" element={<Saved/>} /></Routes>;}
