const BASE_URL = 'http://localhost:8087/api/code';

export const codeService = {
    async runCode(code: string, language: string, input: string = '') {
        try {
            const response = await fetch(`${BASE_URL}/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language, input }),
            });
            if (!response.ok) {
                throw new Error('Failed to run code');
            }
            return await response.text();
        } catch (error) {
            console.error('Code Execution Error:', error);
            throw error;
        }
    }
};
