import { useState, type FormEvent } from 'react';
import { TextInput } from '../text-input/TextInput';
import { Button } from '../button/Button';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form data-testid="login-form" onSubmit={handleSubmit}>
      <TextInput
        name="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextInput
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">Login</Button>
      {submitted && <p data-testid="welcome">Welcome, {username}!</p>}
    </form>
  );
}
