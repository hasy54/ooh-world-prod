'use client'

import { useEffect, useState } from 'react';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetch(`/api/enquiries?ownerId=OWNER_ID&status=${statusFilter}`) // Replace OWNER_ID dynamically
      .then((res) => res.json())
      .then((data) => setEnquiries(data.enquiries));
  }, [statusFilter]);

  return (
    <div>
      <h2>Enquiries</h2>
      <select onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <ul>
        {enquiries.map((enquiry: any) => (
          <li key={enquiry.id}>
            <p>{enquiry.media.name}</p>
            <p>Status: {enquiry.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
