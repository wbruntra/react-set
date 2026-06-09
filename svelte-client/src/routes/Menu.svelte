<script lang="ts">
  import { push } from 'svelte-spa-router'
  import Card from '@/components/Card.svelte'

  function goToTraining() {
    push('/training')
  }

  function goToSolo() {
    push('/solo')
  }
</script>

<div class="container bg-light-purple mt-3 mt-md-5 p-4">
  <h1 class="d-none d-md-block text-center mb-3 mb-md-5">Main Menu</h1>
  <div class="row justify-content-center">
    <div class="col-9 col-md-4">
      <button class="card shadow-sm mb-3 mb-md-4" onclick={goToSolo}>
        <Card desc="1121" />
      </button>
      <p class="text-center">Solo Play</p>
    </div>
    <div class="col-9 col-md-4">
      <button class="card shadow-sm mb-3 mb-md-4" onclick={goToTraining}>
        <Card desc="0012" />
      </button>
      <p class="text-center">Training Mode</p>
    </div>
  </div>
</div>

<style>
  .container {
    background-color: #e4deff;
    border-radius: 8px;
  }

  .card {
    background-color: #f7f8fa;
    color: #2c3e50;
    border: 1px solid #e8eaed;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card:active {
    transform: translateY(0);
  }

  h1 {
    color: #2c3e50;
  }

  p {
    color: #2c3e50;
  }

  :global(.mt-3) {
    margin-top: 1rem;
  }

  :global(.mt-md-5) {
    @media (min-width: 768px) {
      margin-top: 3rem;
    }
  }

  :global(.p-4) {
    padding: 1.5rem;
  }

  :global(.mb-3) {
    margin-bottom: 1rem;
  }

  :global(.mb-md-4) {
    @media (min-width: 768px) {
      margin-bottom: 1.5rem;
    }
  }

  :global(.text-center) {
    text-align: center;
  }

  :global(.d-none) {
    display: none;
  }

  :global(.d-md-block) {
    @media (min-width: 768px) {
      display: block;
    }
  }

  :global(.row) {
    display: flex;
    flex-wrap: wrap;
    margin-left: -15px;
    margin-right: -15px;
  }

  :global(.justify-content-center) {
    justify-content: center;
  }

  :global(.col-9) {
    flex: 0 0 75%;
    max-width: 75%;
    padding-left: 15px;
    padding-right: 15px;
  }

  :global(.col-md-4) {
    @media (min-width: 768px) {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
    }
  }

  :global(.shadow-sm) {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
</style>
