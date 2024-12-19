"use client";

import './index.css'
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address, Bytes32Input } from "~~/components/scaffold-eth";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { assert } from 'console';
import { Integer } from 'type-fest';


const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useScaffoldWriteContract("YourContract");

  const [voterAdd, setVoterAdd] = useState("");
  const [weightAdd, setWeightAdd] = useState("");
  const [proposals, setProposals] = useState("");
  const [vote, setVote] = useState("");
  const [delegate, setDelegate] = useState("");
  const [delegateWeight, setDelegateWeight] = useState("");


  const giveRightToVote = async () => {
    try {
      await writeContractAsync({
        functionName: "giveRightToVote",
        args: [voterAdd, BigInt(weightAdd)],
      });
      console.log("Transaction successful");
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  const newProposals = async () => {
    let propsByte: `0x${string}`[] = []
    proposals.split(", ").forEach(element => {
      propsByte.push(element as `0x${string}`)
    });

    console.log(proposals)
    console.log(proposals.split(", "))
    console.log(propsByte)
    try {
      await writeContractAsync({
        functionName: "setProposals",
        args: [propsByte],
      });
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  const startVoting = async () => {
    try {
      await writeContractAsync({
        functionName: "startVoting"
      });
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  const endVoting = async () => {
    try {
      await writeContractAsync({
        functionName: "endVoting"
      });
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  const sendVote = async () => {
    try {
      await writeContractAsync({
        functionName: "vote",
        args: [BigInt(parseInt(vote))],
      });
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  const makeDelegation = async () => {
    try {
      await writeContractAsync({
        functionName: "delegate",
        args: [delegate, BigInt(parseInt(delegateWeight))],
      });
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  const revokeDelegation = async () => {
    try {
      await writeContractAsync({
        functionName: "revokeDelegation",
      });
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }



  return (
    <>
      <div className='container'>
        <h1 className='h1-ui'>Ballot</h1>
        <div className="block">
          <h2 className='h2-ui'>Control</h2>
          <div>
            <input className='input-ui'
            type="text" 
            placeholder="Аккаунт"
            value={voterAdd}
            onChange={e => setVoterAdd(e.target.value)}></input>
            <input className='input-ui'
            type="text" 
            placeholder="Вес"
            value={weightAdd}
            onChange={e => setWeightAdd(e.target.value)}></input>
            <button className='button-ui' onClick={giveRightToVote}>Дать избирательное право</button>
          </div>
          <div>
            <input
            onChange={e => setProposals(e.target.value)}
            className='input-ui' type="text" placeholder="Предложения"></input>
            <button onClick={newProposals} className='button-ui'>Назначить предложения</button>
          </div>
          <button
          onClick={startVoting}
          className='button-ui'>Начать голосование</button>
          <button
          onClick={endVoting}
          className='button-ui'>Закончить голосование</button>
        </div>
        <div className="block">
          <h2>Voting</h2>
          <div>
            <input
            onChange={e => setVote(e.target.value)}
            className='input-ui' type="text" placeholder="Номер предложения"></input>
            <button
            onClick={sendVote}
            className='button-ui'>Проголосовать</button>
          </div>
          <div>
            <input
            onChange={e => setDelegate(e.target.value)}
            className='input-ui' type="text" placeholder="Адрес делегата"></input>
            <input
            onChange={e => setDelegateWeight(e.target.value)}
            className='input-ui' type="text" placeholder="Делегируемый вес"></input>
            <button
            onClick={makeDelegation}
            className='button-ui'>Делегировать</button>
            <button
            onClick={revokeDelegation}
            className='button-ui'>Отменить делегирование</button>
          </div>
        </div>
        <div className="block">
          <h2>Наблюдение</h2>
          <div>
            <div>Предложения</div>
            <button
            
            className='button-ui'>Show Proposals</button>
            <div className='output'></div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default Home;
