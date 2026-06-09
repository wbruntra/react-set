<script lang="ts">
  import Router from 'svelte-spa-router'
  import Menu from './routes/Menu.svelte'
  import Training from './components/Training/Training.svelte'
  import Solo from './components/Solo/Solo.svelte'

  const routes = {
    '/': Menu,
    '/training': Training,
    '/solo': Solo,
  }
</script>

<Router {routes} />

<style>
  :global(#app) {
    background-color: #e4deff;
    min-height: 100vh;
  }
</style>
