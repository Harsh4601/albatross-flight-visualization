# Testing Checklist - Large CSV Optimization

Use this checklist to verify that the optimization is working correctly.

## Pre-Test Setup

- [ ] Ensure all files are in place:
  - [ ] `js/script.js` (modified)
  - [ ] `js/dataProcessor.worker.js` (new)
  - [ ] `index.html`
  - [ ] `css/style.css`
  - [ ] `assets/combined.csv` (your 90MB file)

- [ ] Open browser DevTools (F12) before starting
- [ ] Make sure Console tab is visible
- [ ] Close other memory-intensive tabs

## Test 1: Verify Files Are Loaded

1. **Open** `index.html` in Chrome or Edge
2. **Check Console** for any errors:
   - [ ] No "404" errors for missing files
   - [ ] No "Web Worker" errors
   - [ ] Welcome screen appears

**Expected**: Welcome screen shows "Choose CSV File" button

---

## Test 2: Small File (Baseline Test)

**File**: Use `detailed.csv` or any CSV < 10MB

### Steps:
1. [ ] Click "Choose CSV File"
2. [ ] Select small CSV file
3. [ ] Watch progress updates

### Expected Results:
- [ ] "Reading X MB file..." appears
- [ ] Progress updates show (e.g., "Reading row 1,000...")
- [ ] Processing completes in 2-5 seconds
- [ ] 3D visualization appears
- [ ] Charts are displayed
- [ ] Map shows flight path

### Console Should Show:
```
File size: X.XX MB, Target sample size: XXXXX
Loaded XXXX rows from CSV
Processed XXXX points
```

**Status**: ✅ Pass / ❌ Fail

---

## Test 3: Large File (Main Test - 90MB)

**File**: Use `combined.csv` (90MB)

### Steps:
1. [ ] Refresh the page
2. [ ] Click "Choose CSV File"
3. [ ] Select `combined.csv` (90MB)
4. [ ] Watch progress updates carefully

### Expected Results:

#### Phase 1: Reading (5-8 seconds)
- [ ] "Reading 90.X MB file..." appears
- [ ] Row count updates every 500ms
- [ ] Example: "Reading row 125,000..."
- [ ] Browser UI stays responsive (can move mouse, see updates)

#### Phase 2: Processing (5-8 seconds)
- [ ] "Analyzing pressure data... (10%)" appears
- [ ] "Sampling data... (20%)" appears
- [ ] "Processing X of Y records... (50%)" appears
- [ ] Progress percentage increases
- [ ] No browser freeze!

#### Phase 3: Visualization (2-3 seconds)
- [ ] "Building charts..." appears
- [ ] "Building 3D flight path..." appears
- [ ] "Creating geographic map..." appears
- [ ] "Finalizing visualization..." appears

#### Phase 4: Complete
- [ ] Processing overlay disappears
- [ ] 3D flight path is visible
- [ ] Charts show data
- [ ] Map displays flight route
- [ ] Total time: 10-20 seconds

### Console Should Show:
```
File size: 90.XX MB, Target sample size: 5000
Reading 90.X MB file...
Loaded XXXXXX rows from CSV
Processing XXXXXX records...
Analyzing pressure data... (10%)
Sampling data... (20%)
Sampled 5000 points from XXXXXX total points
Processed 5000 points (XXXXXX original rows)
Processing 5000 optimized data points
Building charts...
Building 3D flight path...
Creating geographic map...
```

### Check Memory Usage:
- [ ] Open Chrome Task Manager (Shift + Esc)
- [ ] Find your tab
- [ ] Memory usage should be: **300-600 MB** (not 2-3 GB!)

**Status**: ✅ Pass / ❌ Fail

---

## Test 4: UI Responsiveness During Processing

**During the 10-15 second processing time:**

- [ ] Can move mouse cursor smoothly
- [ ] Progress text updates are visible
- [ ] Browser tab doesn't show "(Not Responding)"
- [ ] Can switch to other tabs and back
- [ ] No beach ball / spinning cursor (Mac)
- [ ] No "Page Unresponsive" dialog (Chrome)

**Status**: ✅ Pass / ❌ Fail

---

## Test 5: Visualization Functionality

**After large file loads successfully:**

### 3D Visualization
- [ ] Flight path is visible
- [ ] Can rotate view (click + drag)
- [ ] Can zoom (scroll wheel)
- [ ] Colors represent altitude correctly
- [ ] Bird model is visible
- [ ] Smooth rendering (no lag)

### Charts (Bottom Sections)
- [ ] Magnetometer chart shows data
- [ ] Accelerometer chart shows data
- [ ] Can change parameters (dropdown menus)
- [ ] Time axes are correct
- [ ] Data looks reasonable

### Map (Top Right)
- [ ] Map loads
- [ ] Flight path visible on map
- [ ] Markers are clickable
- [ ] Colors match altitude

### Navigation
- [ ] "Prev" and "Next" buttons work
- [ ] Can focus on different segments
- [ ] Legend toggle works
- [ ] Reset button works

**Status**: ✅ Pass / ❌ Fail

---

## Test 6: Error Handling

### Test Invalid File:
1. [ ] Try uploading a non-CSV file
2. [ ] Should show error message
3. [ ] Can try again with valid file

**Status**: ✅ Pass / ❌ Fail

---

## Test 7: Multiple Loads

1. [ ] Load small file successfully
2. [ ] Click Reset button
3. [ ] Load 90MB file
4. [ ] Should work without errors
5. [ ] No memory leaks (check Task Manager)

**Status**: ✅ Pass / ❌ Fail

---

## Troubleshooting Guide

### ❌ Test Failed: Console shows "Failed to load worker"
**Fix**: 
- Check that `dataProcessor.worker.js` is in the `js/` folder
- Verify file path is correct
- Refresh and try again

### ❌ Test Failed: Still freezes on large file
**Diagnosis**:
1. Check Console for errors
2. Verify browser version (Chrome 80+, Firefox 75+, Safari 14+)
3. Check available RAM
4. Try closing other applications

### ❌ Test Failed: Memory usage still high (2GB+)
**Possible causes**:
- Browser extensions using memory → Disable extensions
- Multiple tabs open → Close other tabs
- Old worker still running → Refresh page

### ❌ Test Failed: Visualization looks wrong
**Check**:
- Are charts showing data? (should be)
- Is 3D path sparse? (expected for 90MB file - sampled to 5K points)
- Does console show "Processed X points"? (should show ~5000)

### ❌ Test Failed: Very slow (30+ seconds)
**Possible reasons**:
- Low RAM → Close other apps
- Slow disk → SSD recommended
- Old browser → Update browser
- Many other tabs → Close tabs

---

## Performance Benchmarks

Use these as reference:

| Your Result | Expected | Status |
|-------------|----------|--------|
| _____ sec   | 10-15 sec | _____ |
| _____ MB    | 300-500 MB | _____ |
| _____ points | ~5000 points | _____ |

---

## Success Criteria

### ✅ All Tests Pass If:
- [x] Small files load in 2-5 seconds
- [x] 90MB file loads in 10-20 seconds
- [x] Browser never freezes
- [x] Progress updates visible throughout
- [x] Memory usage < 600 MB
- [x] All visualizations work correctly
- [x] Can interact with UI during loading
- [x] Console shows expected logs

### 🎉 **If all checks pass, your optimization is working perfectly!**

---

## Report Results

### Test Summary

| Test | Status | Time | Notes |
|------|--------|------|-------|
| 1. Files Loaded | ⬜ | - | |
| 2. Small File | ⬜ | ___s | |
| 3. Large File (90MB) | ⬜ | ___s | |
| 4. UI Responsive | ⬜ | - | |
| 5. Visualization | ⬜ | - | |
| 6. Error Handling | ⬜ | - | |
| 7. Multiple Loads | ⬜ | - | |

### System Info
- **Browser**: _______________
- **Version**: _______________
- **OS**: macOS _______________
- **RAM**: _____ GB
- **File Size Tested**: _____ MB

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Your application is ready for use!
2. Share with others who need large file processing
3. See `OPTIMIZATION_GUIDE.md` for configuration options
4. Consider deploying (see `DEPLOYMENT_GUIDE.md`)

### If Tests Fail ❌
1. Note which test failed
2. Check Console for specific errors
3. Review `QUICK_START.md` troubleshooting section
4. Verify all files are in correct locations
5. Try in different browser (Chrome recommended)

---

## Questions to Answer

After testing, answer these:

- [ ] Did the 90MB file load without freezing? **YES / NO**
- [ ] Was processing time under 20 seconds? **YES / NO**
- [ ] Did progress updates appear? **YES / NO**
- [ ] Did memory stay under 600 MB? **YES / NO**
- [ ] Can you interact with the visualization? **YES / NO**

**If you answered YES to all → Success!** 🎉

**If any NO → Check troubleshooting section above**

