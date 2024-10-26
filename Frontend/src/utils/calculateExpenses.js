const calculateExpenses = (participants) => {
    // Extract the balances from participants
    const balances = participants.map(p => ({ name: p.name, balance: p.balance }));
  
    const payers = []; // People who owe money
    const receivers = []; // People who are owed money
  
    // Split participants into payers and receivers based on their balances
    balances.forEach(participant => {
      if (participant.balance < 0) {
        payers.push({ ...participant, balance: Math.abs(participant.balance) });
      } else if (participant.balance > 0) {
        receivers.push(participant);
      }
    });
  
    const settlements = [];
  
    // Greedily settle balances
    let i = 0, j = 0;
    while (i < payers.length && j < receivers.length) {
      const payer = payers[i];
      const receiver = receivers[j];
  
      const settlementAmount = Math.min(payer.balance, receiver.balance);
  
      settlements.push({
        from: payer.name,
        to: receiver.name,
        amount: settlementAmount,
      });
  
      // Update the balances after settlement
      payer.balance -= settlementAmount;
      receiver.balance -= settlementAmount;
  
      // Move to the next payer or receiver if their balance is 0
      if (payer.balance === 0) i++;
      if (receiver.balance === 0) j++;
    }
  
    return settlements;
  };
  
//   export default calculateExpenses;