---
paths:
  - "src/**/*.tsx"
---

# Button Links

- We're using the base-ui version of shadcn/ui
- Pass Link as a render prop to the button
- Set the button prop `nativeButton={false}`

Example:

```js
<Button render={<Link href="/onboarding" />} nativeButton={false}>
  Sign up
</Button>
```
