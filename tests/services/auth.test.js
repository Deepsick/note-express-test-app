const authService = require('../../services/auth');

const password = 'sadvg543';
const secondPassword = 'qssfgyt';

describe('Test authService', () => {
  test('Test hashPassword unit. Should hash password', async () => {
    const hashedPassword = await authService.hashPassword(password);
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword.length).not.toBe(0);
  });

  describe('Test comparePasswords unit', () => {
    test('Should match hash and password', async () => {
      const hashedPassword = await authService.hashPassword(password);
      const isMatch = await authService.comparePasswords(hashedPassword, password);
      expect(isMatch).toBe(true);
    });

    test('Should not match hash and password', async () => {
      const hashedPassword = await authService.hashPassword(secondPassword);
      const isMatch = await authService.comparePasswords(hashedPassword, password);
      expect(isMatch).toBe(false);
    });
  });
});
