'use client';

import { useEffect, useState } from 'react';

const UserLocation = () => {
  const [info, setInfo] = useState(null);
  const [flags, setFlags] = useState({});

  useEffect(() => {
    // Fetch user location
    const fetchLocation = async () => {
      try {
        const res = await fetch('/api/location');
        const data = await res.json();
        setInfo(data);
      } catch (err) {
        console.error('Failed to fetch user location:', err);
      }
    };

    // Fetch flags.json from public folder
    const fetchFlags = async () => {
      try {
        const res = await fetch('/flags/flags.json');
        const data = await res.json();
        setFlags(data);
      } catch (err) {
        console.error('Failed to load flags.json:', err);
      }
    };

    fetchLocation();
    fetchFlags();
  }, []);



  return (
    <div className="text-center mt-6">
      {info ? (
        <>
          <p className="text-lg text-blue-100 text-start font-semibold mb-2">Your IP Address</p>
          <div className="flex justify-start text-start items-center gap-2">
            {info.country_code && flags[info.country_code] && (
              <img
                src={flags[info.country_code]}
                alt={info.country}
                className="w-6 h-4 object-cover rounded-sm"
              />
            )}
            <span className="text-white text-lg font-semibold">{info.ip}</span>
          </div>
        </>
      ) : (
        <p className='text-start'>Loading location info...</p>
      )}
    </div>
  );
};

export default UserLocation;
