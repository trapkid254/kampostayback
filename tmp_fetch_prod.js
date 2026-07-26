(async () => {
  try {
    const res = await fetch('https://kampostayback.onrender.com/api/v1/properties/search?university=KARATINA%20UNIVERSITY');
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (err) {
    console.error('ERR', err.message);
  }
})();
