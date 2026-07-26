(async () => {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNWYxNjE2YjhmYjdiNjUyYTZiMGY1ZiIsInJvbGUiOiJsYW5kbG9yZCIsImlhdCI6MTc4NTA5NzI4NSwiZXhwIjoxNzg1MDk4MTg1fQ.BO5pO2PSkJpFnqeZv7_Yk_c4IvynorxaCzz9c908RVo';
    const payload = {
      title: 'E2E Test Property',
      description: 'Test property created via API',
      university: 'JKUAT',
      rent: 5000,
      roomType: 'bedsitter',
      location: { coordinates: { type: 'Point', coordinates: [36.8219, -1.2921] } },
      media: { images: [{ url: 'https://placehold.co/800x600', isPrimary: true }] },
      status: 'published'
    };

    const res = await fetch('http://localhost:5000/api/v1/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
