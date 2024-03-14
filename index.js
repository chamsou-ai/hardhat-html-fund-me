import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
balanceButton.onclick = getBalance;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected !";
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
}

async function getBalance() {
  if(typeof window.ethereum !== "undefined"){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress)
    console.log(`Balance: ${ethers.utils.formatEther(balance)}`)
  }
}
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== "undefined") {
    fundButton.innerHTML = "Funding...";
    console.log(`Funding with ${ethAmount}`);
    // Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Signer
    const signer = provider.getSigner();
    // get Contract using (ABI , Address)
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
    // const transactionRecipt = await transactionResponse.wait(1);
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining: ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash , (transactionRecipt)=>{
      console.log(`Completed with ${transactionRecipt.confirmations} confirmations`);
      resolve();
    })
  })
}

async function withdraw(){
  if(typeof window.ethereum !== "undefiend"){
    console.log("Withdrawing ... ")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}