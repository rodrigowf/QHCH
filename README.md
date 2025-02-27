# Quantum Holographic Perception Hypothesis (QHPH)

**QHPH** (Quantum Holographic Perception Hypothesis) is a theoretical framework that bridges quantum mechanics, neuroscience, and the philosophy of mind to explain consciousness and perception. This repository contains the formal documentation of the QHPH theory and two demonstration applications – a dynamic website and an interactive chat interface – to help share and explore the hypothesis.

## Project Overview

QHPH, formulated by **Rodrigo Werneck Franco**, posits that:  
- **Perception is a quantum superposition** – the brain's state exists as a real quantum wavefunction (a "holographic" field of potential experiences) rather than a single classical state before observation.  
- **Collapse corresponds to cognitive focus or decision** – when a particular experience or observation is made, it's analogous to a wavefunction collapse, selecting one facet of the superposed experience.  
- **Entanglement underlies unified experience** – different regions or elements of the brain are **entangled**, allowing a unified conscious field and scaling of consciousness.  
*(These and other principles are detailed in the documentation.)*

The goal of this project is to **share and demonstrate QHPH** in an accessible way. The dynamic website provides a readable format of the hypothesis with examples, and the chat application allows users to ask questions to an AI that is knowledgeable about QHPH from different perspectives.

## Repository Contents

- **`QHPH.md`** – Main documentation of the Quantum Holographic Perception Hypothesis, including its axioms, mathematical formulation, and implications across ten sections. This is the core theory write-up.  
- **`chat/` directory** – Source code for the chat-based GPT application. This includes:  
  - *Prompt files* (`QHPH_Specialist_prompt.txt`, `QHPH_sage_prompt.txt`, etc.) defining AI personas.  
  - HTML/JS/CSS for the chat interface which allow users to interact with an AI about QHPH. Two modes are provided: **Specialist** (a PhD physicist/neurobiologist persona) and **Sage** (a mystic sage persona), both informed by the QHPH content.  
- **`page/` directory** – Source code for the dynamic website presenting QHPH. Contains `index.html`, styling, and scripts that render the hypothesis content in a user-friendly way with interactive elements and navigation through the sections of the hypothesis.  
- **`server.js`** – A simple Node.js server that serves the files in `page/` and `chat/`. This allows you to run the website and chat application locally for demonstration.  

## Installation and Setup

**Prerequisites:** You should have [Node.js](https://nodejs.org) installed to run the server. An internet connection is required for the chat application to contact the OpenAI API. You will also need an OpenAI API key for the chat application to function. 

**Steps:**

1. **Clone the repository**:  
   ```bash
   git clone https://github.com/rodrigowf/QHPH.git  
   cd QHPH
   ``` 

2. **Install dependencies**:  
   ```bash
   npm install express body-parser fs path axios dotenv
   ```

3. **Set up your OpenAI API key**:  
   Create a `.env` file in the root directory with the following content:
   ```
   OPENAI_API_KEY=your-api-key-here
   PORT=5000
   ```
   Replace `your-api-key-here` with your actual OpenAI API key.

4. **Run the server**:  
   ```bash
   node chat/server.js
   ```  
   This will start a local server on port 5000 (or the port specified in your .env file).

5. **Open the applications**:  
   - For the **QHPH Website**, open your browser to: **`http://localhost:5000/page/index.html`**  
     – This will display the interactive/dynamic webpage explaining the QHPH theory. You can read through the sections of the hypothesis here in a formatted way.  
   - For the **Chat GPT Interface**, open: **`http://localhost:5000/chat/index.html`**  
     – This loads the chat application. You can choose a persona (Specialist or Sage) and ask questions about QHPH. The AI will respond based on the content of the hypothesis.

## Usage Guide

**QHPH Website (`page/index.html`):**  
Navigate through the content which mirrors the QHPH.md document. The site includes multiple sections that match those outlined in the documentation. Use the on-page navigation or scroll to read the hypothesis. It's recommended to start from the introduction to understand the context and then proceed through each numbered section. 

**Chat Application (`chat/index.html`):**  
On loading the chat page, you'll be able to select which AI persona to engage with: 
- **Specialist Persona** – an AI that behaves like a scientist deeply familiar with QHPH, capable of answering technical questions with academic rigor (grounded in physics/neuroscience terminology).  
- **Sage Persona** – an AI that takes on a mystical/philosophical tone (inspired by hermetic and Hindu philosophies) to discuss QHPH in more spiritual or intuitive terms.  

Type your question or prompt in the chat input and submit. The AI will generate a response drawing from the QHPH theory content. You can ask about clarifications of the theory, implications, or even hypothetical scenarios, and the AI will attempt to explain or elaborate from the perspective of QHPH.

*Examples of questions to try:*  
- "**What is the Quantum Holographic Perception Hypothesis in simple terms?**"  
- "**How does wavefunction collapse relate to making a decision, according to QHPH?**"  
- "**What role does entanglement play in consciousness unity?**" (Specialist persona might reference neuroscience, Sage might reference spiritual unity)  

**Note:** The chat application requires a valid OpenAI API key to function. If responses are not appearing, double-check that the key is correctly provided in your `.env` file.

## Contributing

Contributions to improve the theory or the applications are welcome. This can include:  
- **Theory Discussion**: If you have insights, critiques, or expansions on QHPH, you can open an issue or a discussion. Since QHPH bridges multiple fields, constructive feedback or pointers to relevant research are very valuable.  
- **Documentation**: Spot a typo or unclear explanation in the markdown docs? Feel free to submit a pull request with fixes or enhancements. Clearer examples or additional references that support the hypothesis are also welcome.  
- **Code and Features**: You can improve the website's design, add interactive visualizations, or enhance the chat interface (for example, adding a UI toggle for personas, caching responses, or supporting more AI models). Please open an issue to discuss major changes before implementing, to ensure alignment with the project goals.  

When contributing, please follow a standard GitHub workflow (fork the repo, create a feature branch, submit a PR) and ensure your changes are documented. For any questions, you can contact the repository owner by opening an issue.

## License

This project is open-source under the **MIT License**. You are free to use, modify, and distribute this code and content with proper attribution. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This theory builds upon ideas from quantum mechanics (e.g., superposition, entanglement), theories of consciousness (like Penrose-Hameroff's Orch-OR, the holographic brain principle), and philosophies of mind. The formulation of QHPH was inspired by bridging gaps between these disciplines.  
- This was also large inspired and based upon Orch-OR theory by Stuart Hameroff and Sir Roger Penrose.
- Thanks to anyone who engages with this project. Your interest and feedback help refine the hypothesis and its presentation.

## FAQ

### How is QHPH different from other quantum consciousness theories?
QHPH distinguishes itself by focusing on holographic perception as a fundamental property of consciousness, framing perception as a quantum superposition of possible experiences rather than a classical process. Unlike some quantum consciousness theories that focus primarily on neural correlates, QHPH provides a framework for understanding how unified consciousness emerges through quantum entanglement patterns.

### What predictions or tests could validate QHPH?
The hypothesis suggests several potentially testable predictions, including specific patterns of neural activity during perceptual decision-making that would align with quantum rather than classical probability distributions. It also suggests experiments to detect quantum coherence in neural systems under specific conditions of attentional focus.

### Is there empirical support for this hypothesis?
While direct evidence is still emerging, QHPH aligns with several observations in cognitive neuroscience, including the binding problem (how disparate neural activities create unified perception), the non-local nature of consciousness, and certain anomalies in perceptual phenomena that challenge purely classical models. The hypothesis provides a framework for interpreting existing evidence and suggesting new experiments. 