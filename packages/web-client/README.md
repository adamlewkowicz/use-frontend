
# Todo:
  - ## useState:
    - [ ] - when useState received callback as initial value, it should create ref with call expression
            ```js
              useState(getValue) -> ref(getValue())
            ```