# wc-time
ES6 module written in TypeScript and design by web-component use HTML5 <time> with steroids
See full demo - [wc-time-demo](https://webislife.ru/demo/wc-time/) based on this web-component
See [site with live integration](https://webislife.ru) this component for date posts, comments

## Install

```
npm i wc-time
```

## Commands

Available package commands

```
`npm run sass' - build scss styles
`npm run tsc' - run typescript
`npm run babel-minify' - minify code after typescript
`npm run build' - build all stpes 1.sass 2.tsc 3.babel-minify
```

## Custom element demo
<!--
```
<custom-element-demo>
  <template>
    <link rel="import" href="index.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<p> 1 febrary <code>lang=ru</code> 🇷🇺 <time is="wc-time" lang="ru" datetime="2023-02-01">1 февраля 2023</time>
<p> 13 мая <code>lang=en</code> 🏴󠁧󠁢󠁥󠁮󠁧󠁿 <time is="wc-time" lang="en" datetime="2023-05-13">1 febrary </time>
```

See full demo - [wc-time-demo](https://webislife.ru/demo/wc-time/) based on this web-component

Dont forgot star on git! Thank you! Enojoy!

dev by strokoff.ru - make web not war)
See real integration in webislife.ru - web dev blog for ru developers