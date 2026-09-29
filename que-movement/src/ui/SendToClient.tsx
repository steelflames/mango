import { useState } from 'react';
import { POSITION_LABEL } from '../content/content';
import { SPECIAL_TEACHING, TEACHING } from '../content/teaching';
import { doseLabel, sequenceStats } from '../game/rules';
import { useStore } from '../game/store';
import type { Sequence } from '../game/types';
import { useInput } from '../input/InputProvider';
import { useOverlays } from './Overlays';
import { sfx } from './sound';

/** A Sequence written out as a class plan a client can read on their phone. */
export function classPlan(seq: Sequence, studio: string, note: string, content: ReturnType<typeof useStore>['content']): string {
  const st = sequenceStats(seq.slots, content);
  const lines = st.views.map((v, i) => {
    const c = v.card;
    const mods = v.modifiers.length ? ` (+ ${v.modifiers.map((m) => m.name).join(', ')})` : '';
    if (c.kind === 'transition') return `${i + 1}. ${c.name} · Transition\n   ${SPECIAL_TEACHING[c.id]?.cues[0] ?? c.shortCue}`;
    const dose = c.kind === 'movement' ? `${POSITION_LABEL[c.position]} · ${doseLabel(c.dose)}` : c.effect;
    const easier = c.kind === 'movement' ? TEACHING[c.id]?.easier : undefined;
    return `${i + 1}. ${c.name}${mods} · ${dose}\n   ${c.shortCue}${easier ? `\n   Easier: ${easier.name}. ${easier.how}` : ''}`;
  });
  const out = [seq.name, `A class plan from ${studio}`];
  if (seq.seeded) out.push(`Adapted from ${seq.author} (${seq.studio ?? 'In the Queue'})`);
  if (note) out.push('', note);
  out.push('', ...lines, '', `About ${st.durationLabel}`);
  out.push('This plan is general guidance, not medical advice. Move at your own pace and stop if anything hurts. If you are pregnant or recently postnatal, recovering from injury or surgery, or have a health condition, check with your clinician before you start.', '— made with Que Movement');
  return out.join('\n');
}

export function SendToClient({ seq }: { seq: Sequence }) {
  const { state, dispatch, content } = useStore();
  const { closeSheet } = useOverlays();
  const { toast } = useInput();
  const [clientId, setClientId] = useState(state.clients[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(state.clients.length === 0);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const client = state.clients.find((c) => c.id === clientId);
  const plan = classPlan(seq, state.studioName, note ? `${client ? `For ${client.name}: ` : ''}${note}` : '', content);
  const history = state.sent.filter((p) => p.clientId === clientId);

  const addClient = () => {
    if (!name.trim()) return;
    const id = `c-${Date.now().toString(36)}`;
    dispatch({ type: 'client/add', id, name: name.trim(), focus: focus.trim() });
    setClientId(id); setAdding(false); setName(''); setFocus('');
  };
  const send = async () => {
    if (!client) return;
    dispatch({ type: 'client/send', clientId: client.id, sequenceId: seq.id, note });
    sfx.badge();
    let how = 'copied, ready to paste into a message';
    try {
      if (navigator.share) { await navigator.share({ title: seq.name, text: plan }); how = 'shared'; }
      else await navigator.clipboard.writeText(plan);
    } catch { how = 'saved to their history'; }
    toast(`${seq.name} sent to ${client.name}: ${how}.`);
    closeSheet();
  };

  return (
    <div className="send">
      <section>
        <h3 className="arrange__label">To</h3>
        <div className="arrange__opts" role="radiogroup" aria-label="Client">
          {state.clients.map((c) => (
            <button key={c.id} type="button" role="radio" aria-checked={clientId === c.id} className={`chip ${clientId === c.id ? 'is-on' : ''}`} onClick={() => setClientId(c.id)} title={c.focus}>{c.name}</button>
          ))}
          <button type="button" className="chip" onClick={() => setAdding((a) => !a)} aria-expanded={adding}>+ New client</button>
        </div>
        {client && !adding && <p className="muted send__focus">{client.focus ? `Focus: ${client.focus}` : 'No focus noted yet'}{history.length ? ` · ${history.length} plan${history.length > 1 ? 's' : ''} sent before` : ''}</p>}
        {adding && (
          <div className="send__add">
            <input className="field__input" placeholder="Name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
            <input className="field__input" placeholder="Focus (optional): lower back, balance…" value={focus} maxLength={60} onChange={(e) => setFocus(e.target.value)} />
            <button type="button" className="btn btn--ghost btn--small" aria-disabled={!name.trim() || undefined} onClick={addClient}>Add client</button>
          </div>
        )}
      </section>
      <label className="field">
        <span className="field__label">A note from you</span>
        <textarea className="field__input field__input--area" rows={2} maxLength={240} value={note} placeholder="Try this Tuesday and Thursday. Go slowly on the Roll Up." onChange={(e) => setNote(e.target.value)} />
      </label>
      <section>
        <h3 className="arrange__label">What they’ll get</h3>
        <pre className="send__plan">{plan}</pre>
      </section>
      <div className="details__actions">
        <button type="button" className="btn btn--primary" data-autofocus="" aria-disabled={!client || undefined} onClick={() => void send()}>{client ? `Send to ${client.name}` : 'Choose a client'}</button>
        <button type="button" className="btn btn--ghost" onClick={closeSheet}>Not now</button>
      </div>
      <p className="muted send__honest">For now this copies the plan (or opens your device’s share sheet) so you can send it by message or email. Accounts and in-app delivery come later.</p>
    </div>
  );
}
