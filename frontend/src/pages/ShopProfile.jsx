import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './ShopProfile.css'

const API = 'http://localhost:1206'

export default function ShopProfile() {
  const navigate = useNavigate()
  const [user, setUser]         = useState(null)
  const [shop, setShop]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)

  const [form, setForm] = useState({
    shopName: '', ownerName: '', phone: '', address: '', profilePicture: ''
  })
  const [picPreview, setPicPreview] = useState('')

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Auth check ──────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('stitches_user')
    if (!stored) { navigate('/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.role !== 'shopOwner') { navigate('/'); return }
    setUser(parsed)
  }, [navigate])

  // ── Load or create profile ──────────────────────────────────
  useEffect(() => {
    if (!user) return
    async function loadProfile() {
      try {
        const res  = await fetch(`${API}/dashboard/profile/${user._id}`)
        const data = await res.json()

        if (data.success && data.shop) {
          setShop(data.shop)
          setForm({
            shopName:       data.shop.shopName       || '',
            ownerName:      data.shop.ownerName      || '',
            phone:          data.shop.phone          || '',
            address:        data.shop.address        || '',
            profilePicture: data.shop.profilePicture || '',
          })
          setPicPreview(data.shop.profilePicture || '')
        } else {
          // First time — auto-create profile from user data
          const createRes  = await fetch(`${API}/dashboard/profile`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id, ownerName: user.name, email: user.email }),
          })
          const createData = await createRes.json()
          if (createData.success) {
            setShop(createData.shop)
            setForm({
              shopName: createData.shop.shopName || '',
              ownerName: createData.shop.ownerName || '',
              phone: '', address: '', profilePicture: '',
            })
          }
        }
      } catch { showToast('Could not load profile.', 'error') }
      setLoading(false)
    }
    loadProfile()
  }, [user])

  // ── Profile picture file → base64 ───────────────────────────
  function handlePicFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPicPreview(reader.result)
      setForm(f => ({ ...f, profilePicture: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  // ── Save profile ────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    try {
      const res  = await fetch(`${API}/dashboard/profile/${user._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setShop(data.shop)
        setEditing(false)
        showToast('Profile updated successfully')
      } else showToast(data.message, 'error')
    } catch { showToast('Could not save profile.', 'error') }
    setSaving(false)
  }

  if (loading) return (
    <div className="page"><div className="state-loading"><div className="spinner" /><p>Loading profile...</p></div></div>
  )

  return (
    <div className="page profile-page">
      {/* Back link */}
      <Link to="/shop-dashboard" className="profile-back">← Back to Dashboard</Link>

      <div className="profile-card">
        {/* Profile picture */}
        <div className="profile-pic-section">
          <div className="profile-pic-wrap">
            {picPreview
              ? <img src={picPreview} alt="Profile" className="profile-pic" />
              : <div className="profile-pic-placeholder">
                  {form.ownerName ? form.ownerName[0].toUpperCase() : '👤'}
                </div>
            }
            {editing && (
              <label className="profile-pic-edit-btn" title="Change photo">
                📷
                <input type="file" accept="image/*" className="hidden-input" onChange={handlePicFile} />
              </label>
            )}
          </div>
          <div className="profile-name-block">
            <h2 className="profile-name">{shop?.ownerName || user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="profile-role-badge">Shop Owner</span>
          </div>
        </div>

        {/* Divider */}
        <div className="profile-divider" />

        {/* Fields */}
        <div className="profile-fields">
          {[
            { key: 'shopName',  label: 'Shop Name',    placeholder: "Your shop's name" },
            { key: 'ownerName', label: 'Owner Name',   placeholder: 'Your full name' },
            { key: 'phone',     label: 'Phone Number', placeholder: '+880 1XXX XXXXXX' },
            { key: 'address',   label: 'Shop Address', placeholder: 'Street, City, Country' },
          ].map(field => (
            <div key={field.key} className="profile-field">
              <label className="profile-field-label">{field.label}</label>
              {editing
                ? (
                  <input
                    className="profile-field-input"
                    value={form[field.key]}
                    placeholder={field.placeholder}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  />
                ) : (
                  <p className="profile-field-value">
                    {shop?.[field.key] || <span className="profile-field-empty">Not set</span>}
                  </p>
                )
              }
            </div>
          ))}

          {/* Email — always read only */}
          <div className="profile-field">
            <label className="profile-field-label">Email</label>
            <p className="profile-field-value readonly">{user?.email}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="profile-divider" />

        {/* Action buttons */}
        <div className="profile-actions">
          {editing ? (
            <>
              <button className="btn btn-plum btn-lg" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => { setEditing(false); setPicPreview(shop?.profilePicture || '') }}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-dark btn-lg" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
          </div>
        </div>
      )}
    </div>
  )
}
