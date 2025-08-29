# D2 Basic Test

This page demonstrates using D2 code blocks inside pure Markdown, rendered via the D2 Workbench.

## Example A: Simple Flow (Workbench)

```d2 {"name":"Simple Flow", "workbench": false}
x: Start
y: Process
z: End

x -> y: next
y -> z: finish
```

## Example B: Pad & Theme

```d2 {"name":"Pad & Theme", "pad":16, "themeID":0}
a: Alpha
b: Beta

a -> b: link
```

## Example C: Sketch and Scale

```d2 {"name":"Sketch x1.5", "sketch": true, "scale": 1.5}
foo -> bar
bar -> baz
```

## Example D: Dark Theme Preference

```d2 {"name":"Dark Theme Preferred", "darkThemeID": 2}
ui: UI Layer
api: API Layer
ui -> api: calls
```
