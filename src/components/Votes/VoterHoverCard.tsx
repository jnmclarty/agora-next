"use client";

import React, { useEffect, useState } from "react";
import { VStack, HStack } from "@/components/Layout/Stack";
import { DelegateActions } from "../Delegates/DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../Delegates/DelegateCard/DelegateProfileImage";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  address: string;
  fetchDelegate: (addressOrENSName: string) => Promise<any>;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  fetchVotingPowerForSubdelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  checkIfDelegatingToProxy: (addressOrENSName: string) => Promise<boolean>;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<any>;
  fetchDirectDelegatee: (addressOrENSName: string) => Promise<any>;
  getProxyAddress: (addressOrENSName: string) => Promise<string>;
  isAdvancedUser: boolean;
}

export default function VoterHoverCard({
  address,
  fetchDelegate,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  fetchDirectDelegatee,
  getProxyAddress,
  isAdvancedUser,
}: Props) {
  const router = useRouter();
  const [delegate, setDelegate] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    href: string
  ) => {
    e.preventDefault();
    router.push(href);
  };

  const fetchDelegateAndSet = async (addressOrENSName: string) => {
    const delegate = await fetchDelegate(addressOrENSName);
    setLoading(false);
    setDelegate(delegate);
  };

  useEffect(() => {
    fetchDelegateAndSet(address);
  }, []);

  return (
    <>
      {loading ? (
        <VStack gap={4} className="h-full w-[300px] p-2">
          <VStack gap={4} justifyContent="justify-center">
            <HStack gap={4} justifyContent="justify-start">
              <div className="w-14 h-14 rounded-full bg-gray-300 animate-pulse" />
              <VStack gap={2} justifyContent="justify-center">
                <div className="w-24 h-4 rounded-md bg-gray-300 animate-pulse" />
                <div className="w-12 h-4 rounded-md bg-gray-300 animate-pulse" />
              </VStack>
            </HStack>
            <div className="w-full h-12 rounded-md bg-gray-300 animate-pulse" />
          </VStack>
        </VStack>
      ) : (
        <VStack gap={4} className="h-full w-[300px]">
          <Link href={`/delegates/${delegate.address}`}>
            <VStack gap={4} justifyContent="justify-center">
              <DelegateProfileImage
                address={delegate.address}
                votingPower={delegate.votingPower}
              />
              <p
                className={`break-words text-gray-600 overflow-hidden line-clamp-2 text-ellipsis`}
              >
                {delegate.statement?.delegateStatement &&
                  `${delegate.statement?.delegateStatement.slice(0, 120)}`}
              </p>
            </VStack>
          </Link>
          <div className="flex-grow" />
          <DelegateActions
            delegate={delegate}
            fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
            fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
            checkIfDelegatingToProxy={checkIfDelegatingToProxy}
            fetchCurrentDelegatees={fetchCurrentDelegatees}
            getProxyAddress={getProxyAddress}
            isAdvancedUser={isAdvancedUser}
            fetchDirectDelegatee={fetchDirectDelegatee}
          />
        </VStack>
      )}
    </>
  );
}
