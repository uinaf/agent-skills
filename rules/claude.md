# Claude, you should pay extra attention to these

## Source comments

- Default to writing no new source comments. Add one only when the code cannot express an essential non-obvious invariant, external constraint, safety concern, or necessary workaround; first prefer clearer names, types, or structure
- Never add comments that restate the code, narrate control flow or an edit, explain obvious types or branches, preserve implementation history or agent reasoning, or teach the reader how straightforward code works
- Existing comment density, a request to explain the work, or a complicated implementation does not authorize more commentary in the code. Before handoff, review every source comment you added and remove it unless deleting it would make an essential non-obvious constraint materially harder to understand
