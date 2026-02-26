<script lang="ts">
  import { TextInput } from '../text-input';
  import { Button } from '../button';

  let username = $state('');
  let password = $state('');
  let submitted = $state(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    submitted = true;
  }
</script>

<form data-testid="login-form" onsubmit={handleSubmit}>
  <TextInput name="username" type="text" bind:value={username} />
  <TextInput name="password" type="password" bind:value={password} />
  <Button type="submit">Login</Button>
  {#if submitted}
    <p data-testid="welcome">Welcome, {username}!</p>
  {/if}
</form>
