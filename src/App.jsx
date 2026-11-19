import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, Check, Clock3, FileText, Flame, GraduationCap, Headphones, LogOut, Mic, Paperclip, Play, Plus, Send, Sparkles, Trophy, Upload, Users, X } from 'lucide-react'
import { isSupabaseConfigured, STORAGE_BUCKET, supabase } from './supabase'

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'
const getError = (error) => error?.message || 'Something went wrong. Please try again.'

function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        if (authError) throw authError
        setNotice(data.session ? 'Account created. Your student dashboard is ready.' : 'Account created. Check your email to confirm your address, then sign in.')
        setMode('login')
      } else if (mode === 'reset') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
        if (authError) throw authError
        setNotice('If an account exists for that email, a password reset link is on its way.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) throw authError
      }
    } catch (authError) { setError(getError(authError)) } finally { setBusy(false) }
  }

  return <main className="auth-wrap"><section className="auth-card"><div className="brand-mark"><BookOpen size={23} /></div><p className="eyebrow">ACE ENGLISH • CLASSROOM</p><h1>{mode === 'signup' ? 'Start learning' : mode === 'reset' ? 'Reset password' : 'Welcome back'}</h1><p className="muted">{mode === 'signup' ? 'Create your student account and join your class.' : 'Sign in to see homework and track your progress.'}</p>
    <form onSubmit={submit} className="auth-form">{mode === 'signup' && <label>Full name<input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>}<label>Email address<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>{mode !== 'reset' && <label>Password<input required minLength={8} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" /></label>}{error && <p className="alert error">{error}</p>}{notice && <p className="alert success">{notice}</p>}<button className="primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create student account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button></form>
    <div className="auth-links">{mode === 'login' && <button onClick={() => { setMode('reset'); setError(''); setNotice('') }}>Forgot password?</button>}<button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setNotice('') }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New student? Create an account'}</button></div><p className="auth-foot">Teacher accounts are created by the classroom administrator. <a href="/SUPABASE_SETUP.md">Setup guide</a></p>
  </section></main>
}

function SetupScreen() {
  return <main className="setup-wrap"><section className="auth-card"><div className="brand-mark"><BookOpen size={23} /></div><p className="eyebrow">ACE ENGLISH • FIRST-TIME SETUP</p><h1>Connect your classroom</h1><p className="muted">Add your Supabase project credentials to enable accounts, homework, and file storage.</p><ol className="setup-steps"><li>Create a Supabase project and run <code>supabase/schema.sql</code> in its SQL Editor.</li><li>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your Netlify environment variables.</li><li>Redeploy the site. See <a href="https://github.com/bekmurodmirpulatov-code/tutor-bekmurod/blob/main/SUPABASE_SETUP.md">the full setup guide</a>.</li></ol><p className="alert">These public client settings are safe for the browser when database Row Level Security is enabled. Never put a Supabase service-role key in the site.</p></section></main>
}

function HomeworkCard({ assignment, onSubmit, busy }) {
  const [answer, setAnswer] = useState('')
  const [file, setFile] = useState(null)
  const [sending, setSending] = useState(false)
  const homework = assignment.homework
  const submission = assignment.submissions?.[0]
  async function submit(event) { event.preventDefault(); setSending(true); try { await onSubmit(assignment, answer, file); setAnswer(''); setFile(null) } finally { setSending(false) } }
  return <article className="homework-card"><div className="homework-top"><div><span className={`status status-${assignment.status}`}>{assignment.status}</span><h3>{homework?.title}</h3></div><span className="due"><Clock3 size={15} />{formatDate(homework?.due_date)}</span></div>{homework?.description && <p className="homework-description">{homework.description}</p>}{homework?.day_number && <span className="day-tag">Day {homework.day_number}</span>}
    {homework?.material_path && <button className="text-link material-link" onClick={() => busy(homework.material_path)}><Paperclip size={15} /> Download lesson material</button>}
    {submission && <div className="submission-note"><Check size={16} /><span>Submitted {formatDate(submission.submitted_at)}{submission.score != null ? ` • Score ${submission.score}/100` : ''}{submission.feedback ? ` • ${submission.feedback}` : ''}</span></div>}
    {assignment.status !== 'graded' && <form className="submission-form" onSubmit={submit}><label className="sr-only" htmlFor={`answer-${assignment.id}`}>Your answer</label><textarea id={`answer-${assignment.id}`} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer or add a note…" rows="2"/><div className="submission-actions"><label className="file-picker"><Upload size={15}/>{file ? file.name : 'Attach a file'}<input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><button className="primary small" disabled={sending || (!answer.trim() && !file)}><Send size={14}/>{sending ? 'Sending…' : submission ? 'Add submission' : 'Submit homework'}</button></div></form>}
  </article>
}

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [homework, setHomework] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [showComposer, setShowComposer] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [form, setForm] = useState({ title: '', description: '', day_number: '', due_date: '', students: [] })
  const [material, setMaterial] = useState(null)
  const [gradeDrafts, setGradeDrafts] = useState({})
  const isTeacher = profile?.role === 'teacher'
  const completed = useMemo(() => assignments.filter((a) => ['submitted', 'graded'].includes(a.status)).length, [assignments])

  const loadData = useCallback(async () => {
    if (!session || !profile) return
    setLoading(true); setError('')
    try {
      if (profile.role === 'teacher') {
        const [studentResult, homeworkResult, assignmentResult, submissionResult] = await Promise.all([
          supabase.from('profiles').select('id, full_name, level, created_at').eq('role', 'student').order('full_name'),
          supabase.from('homework').select('*').order('created_at', { ascending: false }),
          supabase.from('assignments').select('id, homework_id, student_id, status, assigned_at').order('assigned_at', { ascending: false }),
          supabase.from('submissions').select('id, assignment_id, file_path, answer_text, submitted_at, score, feedback').order('submitted_at', { ascending: false }),
        ])
        for (const result of [studentResult, homeworkResult, assignmentResult, submissionResult]) if (result.error) throw result.error
        setStudents(studentResult.data || []); setHomework(homeworkResult.data || []); setAssignments(assignmentResult.data || []); setSubmissions(submissionResult.data || [])
      } else {
        const { data, error: queryError } = await supabase.from('assignments').select('id, homework_id, student_id, status, assigned_at, homework:homework_id(id,title,description,day_number,due_date,material_path), submissions(id,assignment_id,file_path,answer_text,submitted_at,score,feedback)').eq('student_id', session.user.id).order('assigned_at', { ascending: false })
        if (queryError) throw queryError
        setAssignments(data || [])
      }
    } catch (loadError) { setError(getError(loadError)) } finally { setLoading(false) }
  }, [session, profile])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    supabase.auth.getSession().then(async ({ data }) => { if (alive) setSession(data.session) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { if (alive) { setSession(nextSession); setProfile(null) } })
    return () => { alive = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!session) { setProfile(null); setAuthLoading(false); return }
    let alive = true
    async function getProfile() {
      setAuthLoading(true)
      const { data, error: profileError } = await supabase.from('profiles').select('id, full_name, role, level').eq('id', session.user.id).maybeSingle()
      if (!alive) return
      if (profileError) setError(getError(profileError))
      else if (!data) setError('Your account profile is missing. Please contact the teacher.')
      else { setProfile(data); setError('') }
      setAuthLoading(false)
    }
    getProfile()
    return () => { alive = false }
  }, [session])

  useEffect(() => { if (profile) loadData() }, [profile, loadData])

  async function signOut() { await supabase.auth.signOut(); setSession(null); setProfile(null); setAssignments([]) }

  async function signedDownload(path) {
    setUploading(path)
    try { const { data, error: storageError } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 60)
      if (storageError) throw storageError
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch (downloadError) { setError(getError(downloadError)) } finally { setUploading('') }
  }

  async function createHomework(event) {
    event.preventDefault(); setSaving(true); setError('')
    try {
      if (!form.students.length) throw new Error('Select at least one student to assign this homework.')
      const { data: created, error: createError } = await supabase.from('homework').insert({ title: form.title.trim(), description: form.description.trim() || null, day_number: form.day_number ? Number(form.day_number) : null, due_date: form.due_date ? new Date(form.due_date).toISOString() : null, created_by: session.user.id }).select().single()
      if (createError) throw createError
      if (material) {
        const safeName = material.name.replace(/[^\w.-]+/g, '-')
        const path = `${session.user.id}/${created.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, material, { upsert: false })
        if (uploadError) throw uploadError
        const { error: updateError } = await supabase.from('homework').update({ material_path: path }).eq('id', created.id)
        if (updateError) throw updateError
      }
      const rows = form.students.map((studentId) => ({ homework_id: created.id, student_id: studentId }))
      const { error: assignmentError } = await supabase.from('assignments').insert(rows)
      if (assignmentError) throw assignmentError
      setShowComposer(false); setMaterial(null); setForm({ title: '', description: '', day_number: '', due_date: '', students: [] }); await loadData()
    } catch (saveError) { setError(getError(saveError)) } finally { setSaving(false) }
  }

  async function submitHomework(assignment, answer, file) {
    setError('')
    try {
      let filePath = null
      if (file) {
        const safeName = file.name.replace(/[^\w.-]+/g, '-')
        filePath = `${session.user.id}/${assignment.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, { upsert: false })
        if (uploadError) throw uploadError
      }
      const { error: submitError } = await supabase.from('submissions').insert({ assignment_id: assignment.id, file_path: filePath, answer_text: answer.trim() || null })
      if (submitError) throw submitError
      await loadData()
    } catch (submitError) { setError(getError(submitError)); throw submitError }
  }

  async function gradeSubmission(submission, assignmentId) {
    const draft = gradeDrafts[submission.id] || {}
    setError('')
    try {
      const score = draft.score === '' || draft.score == null ? null : Number(draft.score)
      if (score !== null && (score < 0 || score > 100)) throw new Error('Score must be from 0 to 100.')
      const { error: updateError } = await supabase.from('submissions').update({ score, feedback: draft.feedback?.trim() || null }).eq('id', submission.id)
      if (updateError) throw updateError
      const { error: statusError } = await supabase.from('assignments').update({ status: 'graded' }).eq('id', assignmentId)
      if (statusError) throw statusError
      await loadData()
    } catch (gradeError) { setError(getError(gradeError)) }
  }

  if (!isSupabaseConfigured) return <SetupScreen />
  if (authLoading) return <div className="loading-screen"><div className="spinner"/>Loading your classroom…</div>
  if (!session) return <AuthScreen />
  if (!profile) return <main className="setup-wrap"><section className="auth-card"><h1>Profile unavailable</h1><p className="alert error">{error || 'Your account does not have a classroom profile yet.'}</p><p className="muted">Ask your teacher to provision your account, then sign in again.</p><button className="primary" onClick={signOut}>Sign out</button></section></main>

  return <div className="app-shell"><header><nav className="nav"><a className="nav-main" href="#home">General English</a><a href="#homework">Homework</a><a href="#progress">Progress</a>{isTeacher && <a href="#students">Students <span className="count">{students.length}</span></a>}<span className="nav-spacer"/><span className="user-chip">{profile.full_name} · {isTeacher ? 'Teacher' : `Level ${profile.level || 'B2'}`}</span><button className="logout" onClick={signOut}><LogOut size={15}/> Log out</button></nav></header>
    <main className="dashboard"><section className="hero"><div className="hero-copy"><p className="eyebrow">{isTeacher ? 'YOUR CLASSROOM' : `HI ${profile.full_name.toUpperCase()} • YOUR HOMEWORK`}</p><div className="day-line"><h1>{isTeacher ? 'Class progress' : 'Keep going'}</h1></div><p className="motivation">{isTeacher ? 'Assign lessons, review submissions, and celebrate progress.' : 'Small steps every day add up to big progress.'}</p><div className="activity-row"><span className="activity-pill"><span className="icon complete"><Check size={15}/></span>{completed} completed</span><span className="activity-pill"><span className="icon"><BookOpen size={15}/></span>{assignments.length} assigned</span><span className="activity-pill"><span className="icon"><Sparkles size={15}/></span>{completed ? 'Great work!' : 'Your next step awaits'}</span></div></div>{isTeacher ? <div className="teacher-stats"><div><Users/><strong>{students.length}</strong><span>Students</span></div><div><GraduationCap/><strong>{submissions.length}</strong><span>Submissions</span></div><div><Trophy/><strong>{assignments.length ? Math.round(completed / assignments.length * 100) : 0}%</strong><span>Completion</span></div></div> : <div className="progress-card"><div className="ring"><span>{completed}</span><small>of {assignments.length} tasks</small></div><div className="streak"><Flame size={15}/>{completed ? 'Progress made!' : 'Ready to start'}</div></div>}</section>
      {error && <div className="alert error page-alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss"><X size={17}/></button></div>}
      {isTeacher ? <><section className="panel" id="students"><div className="panel-heading"><div><h2>Your students</h2><p className="muted">Homework completion across your class</p></div><button className="primary" onClick={() => setShowComposer((value) => !value)}><Plus size={17}/>{showComposer ? 'Close' : 'Assign homework'}</button></div>{showComposer && <form className="composer" onSubmit={createHomework}><div className="form-grid"><label>Homework title<input required maxLength="120" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Unit 4 vocabulary"/></label><label>Day number (optional)<input type="number" min="1" max="365" value={form.day_number} onChange={(e) => setForm({ ...form, day_number: e.target.value })} placeholder="1"/></label><label>Due date<input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}/></label><label className="span-two">Instructions<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Explain what students should do…"/></label></div><label className="file-picker material-picker"><Upload size={16}/>{material ? material.name : 'Attach lesson material'}<input type="file" onChange={(e) => setMaterial(e.target.files?.[0] || null)}/></label><div className="student-select"><div className="select-heading"><strong>Assign to students</strong><button type="button" className="text-link" onClick={() => setForm({ ...form, students: form.students.length === students.length ? [] : students.map((s) => s.id) })}>{form.students.length === students.length ? 'Clear all' : 'Select all'}</button></div>{students.length ? <div className="student-checks">{students.map((student) => <label key={student.id}><input type="checkbox" checked={form.students.includes(student.id)} onChange={(e) => setForm({ ...form, students: e.target.checked ? [...form.students, student.id] : form.students.filter((id) => id !== student.id) })}/>{student.full_name}</label>)}</div> : <p className="muted">No student accounts yet. Students can sign up from the login screen.</p>}</div><button className="primary" disabled={saving || !students.length}><Send size={16}/>{saving ? 'Saving assignment…' : 'Create and assign'}</button></form>}
        <div className="student-table">{students.length ? students.map((student) => { const mine = assignments.filter((item) => item.student_id === student.id); const done = mine.filter((item) => ['submitted','graded'].includes(item.status)).length; const percent = mine.length ? Math.round(done / mine.length * 100) : 0; return <div className="student-row" key={student.id}><div className="avatar">{student.full_name?.[0]?.toUpperCase() || '?'}</div><div><strong>{student.full_name}</strong><small>{mine.length} assigned · {done} submitted</small></div><div className="student-bar"><span style={{ width: `${percent}%` }}/></div><b>{percent}%</b></div> }) : <div className="empty-state"><Users/><h3>No students yet</h3><p>Share the site with your class and ask students to create an account.</p></div>}</div></section>
        <section className="panel"><div className="panel-heading"><div><h2>Recent submissions</h2><p className="muted">Review answers and give feedback</p></div></div>{submissions.length ? <div className="review-list">{submissions.map((submission) => { const assignment = assignments.find((item) => item.id === submission.assignment_id); const student = students.find((item) => item.id === assignment?.student_id); const task = homework.find((item) => item.id === assignment?.homework_id); const draft = gradeDrafts[submission.id] || { score: submission.score ?? '', feedback: submission.feedback ?? '' }; return <article className="review-card" key={submission.id}><div className="review-head"><div><span className="student-name">{student?.full_name || 'Student'}</span><h3>{task?.title || 'Homework'}</h3></div><span className={`status status-${assignment?.status}`}>{assignment?.status}</span></div>{submission.answer_text && <p className="answer-text">{submission.answer_text}</p>}{submission.file_path && <button className="text-link" onClick={() => signedDownload(submission.file_path)}><Paperclip size={15}/>{uploading === submission.file_path ? 'Preparing download…' : 'Download student file'}</button>}<div className="grade-row"><label>Score<input type="number" min="0" max="100" value={draft.score} onChange={(e) => setGradeDrafts({ ...gradeDrafts, [submission.id]: { ...draft, score: e.target.value } })} placeholder="/100"/></label><label className="feedback-field">Feedback<input value={draft.feedback} onChange={(e) => setGradeDrafts({ ...gradeDrafts, [submission.id]: { ...draft, feedback: e.target.value } })} placeholder="A note for your student"/></label><button className="primary small" onClick={() => gradeSubmission(submission, assignment?.id)}><Check size={15}/>Save grade</button></div></article> })}</div> : <div className="empty-state"><FileText/><h3>No submissions yet</h3><p>Student work will appear here when it is submitted.</p></div>}</section></> : <><section className="panel" id="homework"><div className="panel-heading"><div><h2>My homework</h2><p className="muted">Your assigned work and teacher feedback</p></div><span>{completed} of {assignments.length} complete</span></div>{loading ? <div className="inline-loading"><div className="spinner"/>Loading assignments…</div> : assignments.length ? <div className="homework-list">{assignments.map((assignment) => <HomeworkCard key={assignment.id} assignment={assignment} onSubmit={submitHomework} busy={signedDownload}/>)}</div> : <div className="empty-state"><BookOpen/><h3>No homework assigned yet</h3><p>Your teacher’s assignments will appear here.</p></div>}</section><section className="panel" id="progress"><div className="panel-heading"><div><h2>Achievements</h2><p className="muted">Every submitted assignment is a step forward.</p></div><span>{completed} completed</span></div><div className="achievement-grid">{[['First Step','Submit your first assignment',completed >= 1,BookOpen],['Finding a rhythm','Complete 3 assignments',completed >= 3,Headphones],['One week strong','Complete 7 assignments',completed >= 7,Flame],['Halfway there','Complete 12 assignments',completed >= 12,Trophy],['Almost there','Complete 20 assignments',completed >= 20,Sparkles],['Classroom champion','Complete 24 assignments',completed >= 24,Trophy]].map(([title, text, unlocked, Icon]) => <article className={`achievement ${unlocked ? 'unlocked' : ''}`} key={title}><div className="achievement-icon"><Icon/></div><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section></>}
      <footer className="footer"><span>ACE English classroom</span><span>Keep learning, one day at a time.</span></footer>
    </main></div>
}

export default App
