import { useState } from 'preact/hooks';
import { TextInput } from '../text-input/TextInput';
import { Button } from '../button/Button';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form data-testid="login-form" onSubmit={handleSubmit}>
      <TextInput
        name="username"
        type="text"
        value={username}
        onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
      />
      <TextInput
        name="password"
        type="password"
        value={password}
        onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
      />
      <Button type="submit">Login</Button>
      {submitted && <p data-testid="welcome">Welcome, {username}!</p>}
    </form>
  );
}
