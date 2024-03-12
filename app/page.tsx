'use client'

import Connect from './components/controls/Connect'
import strategies from '../strategies.json'
import { useAccount, useReadContracts, useSimulateContract, useWriteContract } from 'wagmi'
import { parseAbi } from 'viem'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fEvmAddress } from '@/lib/format'
import { MdOutlineCheck } from 'react-icons/md'
import Tokens from './components/controls/Tokens'
import A from './components/controls/A'
import Button from './components/controls/Button'
import { polygon } from 'viem/chains'
import Busy from './components/Busy'
import toast, { Toaster } from 'react-hot-toast'

const chain = polygon
const DISTRIBUTOR = '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'

type Strategy = {
  address: `0x${string}`
  symbol: string
  totalSupply: bigint
  decimals: number
}

const contracts = strategies.map(strategy => [
  {
    address: strategy as `0x${string}`,
    abi: parseAbi(['function symbol() view returns (string)']),
    functionName: 'symbol'
  },
  {
    address: strategy as `0x${string}`,
    abi: parseAbi(['function totalSupply() view returns (uint256)']),
    functionName: 'totalSupply'
  },
  {
    address: strategy as `0x${string}`,
    abi: parseAbi(['function decimals() view returns (uint256)']),
    functionName: 'decimals'
  }
]).flat()

function Page() {
  const multicall = useReadContracts({ contracts })
  const { isConnected } = useAccount()
  const [busy, setBusy] = useState(false)
  const [users, setUsers] = useState<`0x${string}`[]>([])
  const [tokens, setTokens] = useState<`0x${string}`[]>([])
  const [claims, setClaims] = useState<bigint[]>([])
  const [proofs, setProofs] = useState<`0x${string}`[][]>([])

  const strategyDetails = useMemo(() => {
    return strategies.map((strategy, i) => {
      const stride = 3
      const totalSupply = BigInt(multicall.data?.[i * stride + 1].result || 0n)
      const decimals = Number(multicall.data?.[i * stride + 2].result || 0n)
      return {
        address: strategy as `0x${string}`,
        symbol: String(multicall.data?.[i * stride].result || ''),
        totalSupply,
        decimals
      }
    })
  }, [multicall])

  const fetchClaims = useCallback(async () => {
    setBusy(true)
    const _users: `0x${string}`[] = []
    const _tokens: `0x${string}`[] = []
    const _claims: bigint[] = []
    const _proofs: `0x${string}`[][] = []
    try {
      for(const strategy of strategyDetails) {
        if(strategy.totalSupply < 1n) continue
        const response = await fetch(`https://api.angle.money/v2/merkl?chainIds[]=${chain.id}&user=${strategy.address}`)
        const json = await response.json()
        const data = json[String(chain.id)].transactionData
        const tokens = Object.keys(data).filter((k) => data[k].proof !== undefined)
        const claims = tokens.map((t) => data[t].claim)
        const proofs = tokens.map((t) => data[t].proof)
        _users.push(...Array(tokens.length).fill(strategy.address))
        _tokens.push(...tokens.map(t => t as `0x${string}`))
        _claims.push(...claims.map(c => BigInt(c)))
        _proofs.push(...proofs.map(p => p.map((s: string) => s as `0x${string}`)))
      }
      setUsers(_users)
      setTokens(_tokens)
      setClaims(_claims)
      setProofs(_proofs)
    } catch (error) {
      toast.error(`FAIL: ${error}`)
      console.error(error)
    } finally {
      setBusy(false)
    }
  }, [setBusy, strategyDetails, setUsers, setTokens, setClaims, setProofs])

  const simulateClaim = useSimulateContract({
    address: DISTRIBUTOR,
    abi: parseAbi(['function claim(address[] calldata users, address[] calldata tokens, uint256[] calldata amounts, bytes32[][] calldata proofs) external']),
    functionName: 'claim',
    args: [users, tokens, claims, proofs]
  })

  const { writeContract, isPending, isSuccess } = useWriteContract()

  useEffect(() => {
    setBusy(isPending)
  }, [setBusy, isPending])

  const disableClaim = useMemo(() => {
    return !(isConnected && users.length && Boolean(simulateClaim.data?.request))
  }, [isConnected, users, simulateClaim])

  return <main className="relative min-h-screen flex flex-col items-center justify-center">
    <div className={`w-full h-full flex flex-col items-center justify-center p-24 gap-8 ${busy ? 'blur' : ''}`}>
      <h1 className="font-bold text-4xl">yo𝛄𝛄</h1>
      <Connect />
      <div className="flex items-center justify-between gap-4">
        <Button onClick={fetchClaims} disabled={Boolean(users.length)}>1 - fetch claims</Button>
        <Button onClick={() => writeContract(simulateClaim.data!.request)} disabled={disableClaim}>2 - exec claims ({users.length})</Button>
      </div>
      {isSuccess && <div className="w-[420px] p-2 border border-green-500 text-green-500 text-sm text-center">Great success!!</div>}
      {simulateClaim.error && users.length > 0 && <div className="w-[420px] p-2 border border-red-500 text-red-500 text-sm">{simulateClaim.error.message}</div>}
      <table className="table-auto border-separate border-spacing-4 border border-slate-900">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Address</th>
            <th>Supply</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {strategyDetails.map((strategy) => <tr key={strategy.address} className={`
          ${(strategy.totalSupply > 0n) ? '' : 'text-slate-900'}`}>
          <td>{strategy.symbol}</td>
          <td><A href={`https://polygonscan.com/address/${strategy.address}`} target='_blank'>{fEvmAddress(strategy.address)}</A></td>
          <td><Tokens amount={strategy.totalSupply} decimals={strategy.decimals} accuracy={16} padStart={3} /></td>
          <td>{(strategy.totalSupply > 0n) ? <MdOutlineCheck /> : <></>}</td>
        </tr>)}
        </tbody>
      </table>
    </div>
    {busy && <Busy className="absolute inset" />}
    <Toaster position="top-center" />
  </main>
}

export default Page
