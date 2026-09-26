import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, PackageOpen, ShieldCheck } from 'lucide-react'
import { api } from '../api'
import heroArt from '../assets/hero.png'

function AuthPage({ onAuthenticated }) {
    const [mode, setMode] = useState('login')
    const [resetStep, setResetStep] = useState('request')
    const [form, setForm] = useState({ username: '', email: '', phoneNumber: '', password: '', otp: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const update = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))

    async function submit(event) {
        event.preventDefault()
        setError('')
        setNotice('')
        setBusy(true)
        try {
            if (mode === 'login') {
                const result = await api('/api/auth/login', {
                    method: 'POST',
                    body: { email: form.email, password: form.password },
                })
                onAuthenticated(result)
            } else if (mode === 'register') {
                if (form.password.length < 8) throw new Error('Use a password with at least 8 characters.')
                const result = await api('/api/auth/register', {
                    method: 'POST',
                    body: {
                        username: form.username.trim(),
                        email: form.email.trim(),
                        phoneNumber: form.phoneNumber.trim(),
                        password: form.password,
                    },
                })
                onAuthenticated(result)
            } else if (resetStep === 'request') {
                await api('/api/auth/password-reset/request', {
                    method: 'POST',
                    body: { email: form.email.trim() },
                })
                setResetStep('confirm')
                setNotice('If an active account matches that email, a six-digit code is on its way.')
            } else {
                if (form.password !== form.confirmPassword) throw new Error('The passwords do not match.')
                await api('/api/auth/password-reset/confirm', {
                    method: 'POST',
                    body: { email: form.email.trim(), otp: form.otp, newPassword: form.password },
                })
                setMode('login')
                setResetStep('request')
                setForm((previous) => ({ ...previous, password: '', otp: '', confirmPassword: '' }))
                setNotice('Password updated. Sign in with your new password.')
            }
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setBusy(false)
        }
    }

    function changeMode(nextMode) {
        setMode(nextMode)
        setResetStep('request')
        setError('')
        setNotice('')
    }

    const isReset = mode === 'reset'

    return (
        <main className="auth-layout">
            <section className="auth-story" aria-label="StockSense">
                <div className="auth-brand"><span className="brand-mark"><PackageOpen size={19} /></span><span>stocksense</span></div>
                <div className="story-copy">
                    <p className="overline">INVENTORY, IN FOCUS</p>
                    <h1>Know what<br />moves.</h1>
                    <p className="story-text">Every location, every movement, one clear view of your stock.</p>
                    <div className="story-proof"><ShieldCheck size={16} /><span>Protected workspace access</span></div>
                </div>
                <img className="auth-illustration" src={heroArt} alt="" />
                <div className="story-coordinate"><span>STOCK CONTROL / 01</span><span>REAL TIME OPERATIONS</span></div>
            </section>

            <section className="auth-panel">
                <div className="auth-panel-top"><span>STOCKSENSE / IMS</span><span>OPERATIONS PORTAL</span></div>
                <div className="auth-form-wrap">
                    <div className="auth-heading">
                        <p className="overline">{mode === 'login' ? 'WELCOME BACK' : mode === 'register' ? 'NEW WORKSPACE' : 'ACCOUNT ACCESS'}</p>
                        <h2>{mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create your account' : isReset ? 'Reset password' : 'Recover your account'}</h2>
                        <p>{mode === 'login' ? 'Enter your details to continue to inventory.' : mode === 'register' ? 'Set up your StockSense staff account.' : isReset && resetStep === 'confirm' ? `Enter the code sent to ${form.email}.` : 'We will send a one-time code to your email.'}</p>
                    </div>

                    {error && <div className="form-alert form-alert-error" role="alert">{error}</div>}
                    {notice && <div className="form-alert form-alert-success" role="status">{notice}</div>}

                    <form className="auth-form" onSubmit={submit}>
                        {mode === 'register' && <Field label="Username" name="username" value={form.username} onChange={update} placeholder="e.g. alex.morgan" autoComplete="username" required />}
                        {(!isReset || resetStep === 'request') && <Field label="Work email" name="email" type="email" value={form.email} onChange={update} placeholder="you@company.com" autoComplete="email" required />}
                        {mode === 'register' && <Field label="Mobile number" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={update} placeholder="+1 555 123 4567" autoComplete="tel" required />}
                        {isReset && resetStep === 'confirm' && <Field label="Six-digit code" name="otp" inputMode="numeric" maxLength={6} value={form.otp} onChange={update} placeholder="000000" required />}
                        {mode !== 'reset' || resetStep === 'confirm' ? (
                            <div className="field-wrap">
                                <label htmlFor="auth-password">{isReset ? 'New password' : 'Password'}</label>
                                <div className="password-input">
                                    <input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} />
                                    <button className="icon-button password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                                </div>
                            </div>
                        ) : null}
                        {isReset && resetStep === 'confirm' && <Field label="Confirm new password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} autoComplete="new-password" required minLength={8} />}

                        {mode === 'login' && <button className="text-action forgot-link" type="button" onClick={() => changeMode('reset')}>Forgot password?</button>}
                        <button className="button button-primary auth-submit" type="submit" disabled={busy}>
                            {busy ? <span className="spinner" /> : <>{isReset && resetStep === 'request' ? 'Send reset code' : isReset ? 'Update password' : mode === 'register' ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></>}
                        </button>
                    </form>

                    {mode === 'reset' ? (
                        <button className="text-action back-link" type="button" onClick={() => changeMode('login')}><ArrowLeft size={15} /> Back to sign in</button>
                    ) : (
                        <div className="auth-switch">
                            <span>{mode === 'login' ? 'New to StockSense?' : 'Already have an account?'}</span>
                            <button className="text-action" type="button" onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>
                                {mode === 'login' ? 'Create account' : 'Sign in'}
                            </button>
                        </div>
                    )}
                </div>
                <footer className="auth-footer"><span>© StockSense</span><span>SECURE INVENTORY MANAGEMENT</span></footer>
            </section>
        </main>
    )
}

function Field({ label, name, type = 'text', value, onChange, ...props }) {
    return (
        <div className="field-wrap">
            <label htmlFor={`auth-${name}`}>{label}</label>
            <input id={`auth-${name}`} name={name} type={type} value={value} onChange={onChange} {...props} />
        </div>
    )
}

export default AuthPage