# Insurance Module - Quick Fix for Test #4 (Evaluate Triggers)

## Issue
Policy dates cause "Policy is not active or has expired" error

## Solution
Update the policy dates in Postman test #2 (Create Insurance Policy):

### Current (WRONG):
```json
{
    "policy_type": "flood",
    "coverage_amount": 150000,
    "premium_amount": 7500,
    "payment_frequency": "quarterly",
    "start_date": "2025-01-01",  ← Future date!
    "end_date": "2025-12-31"
}
```

### Fixed (CORRECT):
```json
{
    "policy_type": "flood",
    "coverage_amount": 150000,
    "premium_amount": 7500,
    "payment_frequency": "quarterly",
    "start_date": "2024-12-01",  ← Past date (policy already started)
    "end_date": "2025-12-31"      ← Future date (policy still valid)
}
```

Also update Test #3a (Activate Policy) payment_date:
```json
{
    "status": "active",
    "is_paid": true,
    "payment_date": "2024-12-01"  ← Match start_date
}
```

## OR Use Existing Policy from Dummy Data

Test #1 "Get All Policies" retrieves the 2 policies created by `create_insurance_data` command. 
These policies are already active and have valid dates. Just use those for testing!

The existing policies have:
- Status: active ✅
- Is paid: true ✅  
- Start date: 60 days ago ✅
- End date: 305+ days in future ✅

So Test #4 should work with the first policy ID from Test #1!

## Quick Test
Run Test #1, then skip to Test #4 using the first policy ID. It should work!
