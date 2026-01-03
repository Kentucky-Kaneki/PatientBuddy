import { useState, useEffect } from 'react';

export default function Dashboard({ onSignOut }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');


  return (
    <p>JAyaram</p>
  );
}