# Easter Egg - Hidden Test Page 🥚

## How to Access the $1 Test Payment

The test page is now **hidden** from regular users. Only you (and people who know the secret) can access it!

### The Secret

1. Go to the homepage: `https://ibtakarlabs.com`
2. Scroll down to the **"Meet the Founder"** section
3. Click on the **"u"** in "Founder" **5 times**
4. 🎉 You'll automatically be redirected to `/test`

### Why This Works

```javascript
// In App.jsx
const handleEasterEggClick = () => {
  const newCount = easterEggClicks + 1;
  setEasterEggClicks(newCount);

  if (newCount === 5) {
    navigate('/test');
  }
};
```

The "u" in "Meet the Founder" is now clickable (but looks normal):
```jsx
<h2>
  Meet the Fo
  <span onClick={handleEasterEggClick}>u</span>
  nder
</h2>
```

### Features

✅ **Invisible**: The "u" looks exactly like the rest of the text
✅ **No Hover Effect**: Cursor stays as default (not pointer)
✅ **No Selection**: Can't accidentally select it (`userSelect: 'none'`)
✅ **Counter Resets**: Refreshing the page resets the counter
✅ **No URL Access**: Users can't guess `/test` easily

### Direct Access (For You)

You can still access directly via URL:
- Local: `http://localhost:5173/test`
- Production: `https://ibtakarlabs.com/test`

### Testing the Easter Egg

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Open homepage**:
   ```
   http://localhost:5173
   ```

3. **Scroll to "Meet the Founder"**

4. **Click the "u" 5 times**:
   - Click 1: Nothing happens
   - Click 2: Nothing happens
   - Click 3: Nothing happens
   - Click 4: Nothing happens
   - Click 5: 🎉 Redirects to test page!

### Optional: Add Visual Feedback

If you want to see the click count (for testing), add this temporarily:

```jsx
// Show click count (debugging only)
{easterEggClicks > 0 && (
  <div style={{
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    zIndex: 9999
  }}>
    Clicks: {easterEggClicks}/5
  </div>
)}
```

Add this anywhere in the JSX return statement.

### Why This is Better

**Before**: Anyone could access `/test` if they knew the URL

**Now**:
- Test page is "hidden" from regular users
- Only accessible via Easter egg
- Still accessible directly for you via URL
- Customers won't accidentally find it
- You can still test payments easily

### Other Easter Egg Ideas

Want more hidden features? Here are some ideas:

**Double-click logo 3 times** → Show admin panel
```jsx
<img
  src="/logo.png"
  onClick={() => setLogoClicks(logoClicks + 1)}
/>
```

**Type "admin" anywhere on page** → Show hidden menu
```jsx
useEffect(() => {
  let keys = [];
  const handleKeyDown = (e) => {
    keys.push(e.key);
    if (keys.slice(-5).join('') === 'admin') {
      navigate('/admin');
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Konami Code** → Secret feature
```jsx
// Up Up Down Down Left Right Left Right B A
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                'b', 'a'];
```

### Sharing the Secret

Want to tell someone about the test page?

**Don't say**: "Go to ibtakarlabs.com/test"
**Do say**: "Click the 'u' in Founder 5 times"

Much cooler! 😎

---

**The secret is safe!** Only people who know can access the test payment page.
