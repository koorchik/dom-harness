import { createSignal } from 'solid-js';
import { TextInput } from '../text-input/TextInput';
import { Button } from '../button/Button';

export function LoginForm() {
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [submitted, setSubmitted] = createSignal(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form data-testid="login-form" onSubmit={handleSubmit}>
      <TextInput
        name="username"
        type="text"
        value={username()}
        onInput={(e) => setUsername(e.currentTarget.value)}
      />
      <TextInput
        name="password"
        type="password"
        value={password()}
        onInput={(e) => setPassword(e.currentTarget.value)}
      />
      <Button type="submit">Login</Button>
      {submitted() && <p data-testid="welcome">Welcome, {username()}!</p>}
    </form>
  );
}
