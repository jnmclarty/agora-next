"use client";

import { ReactNode, useEffect, useState } from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import HumanAddress from "@/components/shared/HumanAddress";
import Image from "next/image";
import Link from "next/link";
import styles from "./castVoteDialog.module.scss";
import useAdvancedVoting from "../../../../hooks/useAdvancedVoting";
import { CastVoteDialogProps } from "@/components/Dialogs/DialogProvider/dialogs";
import { Button } from "@/components/ui/button";
import { MissingVote, getVpToDisplay } from "@/lib/voteUtils";
import pendingImage from "public/images/action-pending.svg";
import congrats from "public/images/congrats.svg";
import BlockScanUrls from "@/components/shared/BlockScanUrl";

export type SupportTextProps = {
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
};

// TODO: Better rendering for users with no voting power
export function CastVoteDialog(props: CastVoteDialogProps) {
  return <CastVoteDialogContents {...props} />;
}

function CastVoteDialogContents({
  proposalId,
  reason,
  supportType,
  closeDialog,
  votingPower,
  delegate,
  authorityChains,
  missingVote,
}: CastVoteDialogProps) {
  const [localMissingVote, setLocalMissingVote] =
    useState<MissingVote>(missingVote);

  const { write, isLoading, isSuccess, data } = useAdvancedVoting({
    proposalId,
    support: ["AGAINST", "FOR", "ABSTAIN"].indexOf(supportType),
    standardVP: BigInt(votingPower.directVP),
    advancedVP: BigInt(votingPower.advancedVP),
    authorityChains,
    reason,
    missingVote: localMissingVote,
  });

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  useEffect(() => {
    if (
      missingVote == "BOTH" &&
      data?.standardVoteData &&
      !data?.advancedVoteData
    ) {
      setLocalMissingVote("ADVANCED");
    }
  }, [data, missingVote, setLocalMissingVote]);

  if (!delegate) {
    // todo: log
    return null;
  }

  if (
    missingVote === "BOTH" &&
    !data.advancedVoteData &&
    data.standardVoteData
  ) {
    return (
      <VStack gap={4} className={styles.dialog_container}>
        <HStack justifyContent="justify-between">
          <VStack>
            {delegate.address ? (
              <div className={styles.subtitle}>
                <HumanAddress address={delegate.address} />
              </div>
            ) : (
              <div className={styles.subtitle}>Anonymous</div>
            )}
            <div className={styles.title}>
              Casting vote&nbsp;{supportType.toLowerCase()}
            </div>
          </VStack>
          <VStack alignItems="items-end">
            <div className={styles.subtitle}>with</div>
            <TokenAmountDisplay
              amount={vpToDisplay}
              decimals={18}
              currency="OP"
            />
          </VStack>
        </HStack>
        <div className={styles.reason_box}>
          {reason ? (
            <div className={styles.has_reason}>{reason}</div>
          ) : (
            <div className={styles.no_reason}>No voting reason provided</div>
          )}
        </div>
        <div>
          <VoteButton onClick={write}>Sign transaction 2/2</VoteButton>
        </div>
      </VStack>
    );
  }

  return (
    <>
      {!isLoading && !isSuccess && (
        <VStack gap={4} className={styles.dialog_container}>
          <HStack justifyContent="justify-between">
            <VStack>
              {delegate.address ? (
                <div className={styles.subtitle}>
                  <HumanAddress address={delegate.address} />
                </div>
              ) : (
                <div className={styles.subtitle}>Anonymous</div>
              )}
              <div className={styles.title}>
                Casting vote&nbsp;{supportType.toLowerCase()}
              </div>
            </VStack>
            <VStack alignItems="items-end">
              <div className={styles.subtitle}>with</div>
              <TokenAmountDisplay
                amount={vpToDisplay}
                decimals={18}
                currency="OP"
              />
            </VStack>
          </HStack>
          <div className={styles.reason_box}>
            {reason ? (
              <div className={styles.has_reason}>{reason}</div>
            ) : (
              <div className={styles.no_reason}>No voting reason provided</div>
            )}
          </div>
          <div>
            {delegate.statement ? (
              <VoteButton onClick={write}>
                Vote {supportType.toLowerCase()} with{"\u00A0"}
                <TokenAmountDisplay
                  amount={vpToDisplay}
                  decimals={18}
                  currency="OP"
                />
              </VoteButton>
            ) : (
              <NoStatementView closeDialog={closeDialog} />
            )}
          </div>
          {/* @ts-ignore */}
          {missingVote === "BOTH" && <AdvancedVoteAlert />}
        </VStack>
      )}
      {isLoading && <LoadingVote />}
      {isSuccess && data && (
        <SuccessMessage closeDialog={closeDialog} data={data} />
      )}
    </>
  );
}

const VoteButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}) => {
  return (
    <Button onClick={onClick} className="w-full">
      {children}
    </Button>
  );
};

export function AdvancedVoteAlert() {
  return (
    <div className={styles.alert}>
      To cast your vote, you will be requested to sign two transactions, both of
      which are needed to vote with your full balance.
    </div>
  );
}

export function SuccessMessage({
  closeDialog,
  data,
}: {
  closeDialog: () => void;
  data: {
    advancedVoteData: { hash: string } | undefined;
    standardVoteData: { hash: string } | undefined;
  };
}) {
  return (
    <VStack className={styles.full_width}>
      <Image
        width="457"
        height="155"
        src={congrats}
        className="w-full mb-3"
        alt="agora loading"
      />
      <div className="mb-2 text-2xl font-black">
        Your vote has been submitted!
      </div>
      <div className="mb-5 text-sm text-gray-700">
        It might take up to a minute for the changes to be reflected. Thank you
        for participating in Optimism’s token house.
      </div>
      <div>
        <div onClick={closeDialog} className={`${styles.vote_container}`}>
          Got it
        </div>
      </div>
      <BlockScanUrls
        hash1={data.standardVoteData?.hash}
        hash2={data.advancedVoteData?.hash}
      />
    </VStack>
  );
}

export function LoadingVote() {
  return (
    <VStack className={styles.full_width}>
      <img src={`/images/action-pending.svg`} className="w-full mb-3" alt="Vote pending" />
      <div className="mb-2 text-2xl font-black">Casting your vote</div>
      <div className="mb-5 text-sm text-gray-700">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 bg-gray-eo rounded-lg`}
        >
          <div className="font-medium text-gray-700">
            Writing your vote to the chain...
          </div>
        </div>
      </div>
    </VStack>
  );
}

export function NoStatementView({ closeDialog }: { closeDialog: () => void }) {
  return (
    <div className={styles.note_to_user}>
      You do not have a delegate statement.{" "}
      <Link
        href={"/delegates/create"}
        className="underline"
        onClick={closeDialog}
      >
        Please set one up to vote.
      </Link>
    </div>
  );
}

export function DisabledVoteDialog({
  closeDialog,
}: {
  closeDialog: () => void;
}) {
  return (
    <VStack className={styles.full_width}>
      <Image
        width="457"
        height="155"
        src={pendingImage}
        className="w-full mb-3"
        alt="agora loading"
      />
      <div className="mb-2 text-2xl font-black">
        Voting will be available soon!
      </div>
      <div className="mb-5 text-sm text-gray-700">
        Thanks for trying to vote early! It looks like you’ve received votes via
        advanced delegation – a new beta feature. Voting will be enabled
        shortly. Please check back in a few days.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 border border-gray-eo rounded-lg cursor-pointer`}
          onClick={closeDialog}
        >
          <div className="font-medium">Got it, I’ll come back later</div>
        </div>
      </div>
    </VStack>
  );
}
