'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/services/supabaseClient'
import FloatingSidebar from '@/components/ui/FloatingSidebar'

export default function MediaPage() {
  const [media, setMedia] = useState([])
  const [tenantId, setTenantId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [newEnquiry, setNewEnquiry] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    media_id: '',
    message: '',
  })
  const [enquirySuccess, setEnquirySuccess] = useState(false)

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.error('No session found. Redirecting to auth.')
        window.location.href = '/auth'
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', session.user.id)
        .single()

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError)
        throw new Error('Unable to fetch user profile')
      }

      setTenantId(profile.tenant_id)

      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select(`
          *,
          media_images (image_url)
        `)
        .eq('tenant_id', profile.tenant_id)

      if (mediaError) {
        console.error('Error fetching media:', mediaError)
        throw new Error('Unable to fetch media')
      }

      setMedia(mediaData || [])
      console.log('Fetched media:', mediaData)
    } catch (err) {
      console.error('Error in fetchMedia:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEnquiry = async () => {
    try {
      if (!newEnquiry.client_name || !newEnquiry.client_email || !newEnquiry.media_id) {
        throw new Error('Please fill in all required fields.')
      }

      const { error: enquiryError } = await supabase.from('inquiries').insert({
        tenant_id: tenantId,
        media_id: newEnquiry.media_id,
        client_name: newEnquiry.client_name,
        client_email: newEnquiry.client_email,
        client_phone: newEnquiry.client_phone,
        message: newEnquiry.message,
      })

      if (enquiryError) {
        console.error('Error sending enquiry:', enquiryError)
        throw new Error('Failed to send enquiry')
      }

      setNewEnquiry({
        client_name: '',
        client_email: '',
        client_phone: '',
        media_id: '',
        message: '',
      })
      setEnquirySuccess(true)
    } catch (err) {
      console.error('Error in handleEnquiry:', err.message)
      alert(err.message || 'Failed to send enquiry.')
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Media</h1>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <li key={item.id} className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p>Type: {item.type}</p>
            <p>Location: {item.location}</p>
            <p>Price: ${item.price}</p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Images</h3>
              <div className="flex space-x-4 overflow-x-auto">
                {item.media_images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.image_url}
                    alt={`Media ${item.name}`}
                    className="w-32 h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setNewEnquiry((prev) => ({ ...prev, media_id: item.id }))
                setIsSidebarOpen(true)
              }}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Enquire Now
            </button>
          </li>
        ))}
      </ul>

      <FloatingSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Enquire About Media</h2>
        {enquirySuccess && (
          <div className="text-green-500 mb-4">Enquiry sent successfully!</div>
        )}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={newEnquiry.client_name}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, client_name: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={newEnquiry.client_email}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, client_email: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Your Phone"
            value={newEnquiry.client_phone}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, client_phone: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <textarea
            placeholder="Your Message"
            value={newEnquiry.message}
            onChange={(e) => setNewEnquiry({ ...newEnquiry, message: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
          <button
            onClick={handleEnquiry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Send Enquiry
          </button>
        </div>
      </FloatingSidebar>
    </div>
  )
}

