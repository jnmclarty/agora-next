import { fetchProposal as apiFetchProposal } from "@/app/api/common/proposals/getProposals";
import { cleanString, truncateString } from "@/app/lib/utils/text";
import { HStack, VStack } from "@/components/Layout/Stack";
import OPProposalApprovalPage from "@/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage";
import OPProposalOptimisticPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalOptimisticPage";
import OPProposalPage from "@/components/Proposals/ProposalPage/OPProposalPage/OPProposalPage";
import React from "react";

async function fetchProposal(proposal_id) {
  "use server";
  return {
    proposal: await apiFetchProposal(proposal_id)
  };
}

export async function generateMetadata({ params }, parent) {
  const { proposal } = await fetchProposal(params.proposal_id);
  const title = truncateString(cleanString(proposal.markdowntitle), 40);
  const description = truncateString(cleanString(proposal.description), 80);

  const preview = `/api/images/og/proposal?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: preview,
    },
    other: {
      ["twitter:card"]: "summary_large_image",
      ["twitter:title"]: title,
      ["twitter:description"]: description,
      ["twitter:image"]: preview,
    },
  };
}

export default async function Page({ params: { proposal_id } }) {
  const { proposal } = await fetchProposal(proposal_id);

  let RenderComponent;
  switch (proposal.proposalType) {
    case "STANDARD":
      RenderComponent = OPProposalPage;
      break;
    case "OPTIMISTIC":
      RenderComponent = OPProposalOptimisticPage;
      break;
    case "APPROVAL":
      RenderComponent = OPProposalApprovalPage;
      break;
    default:
      // TODO: Fix this but We shouldn't get here
      RenderComponent = null;
  }

  return (
    <HStack justifyContent="justify-between" className="mt-12">
      <div>{RenderComponent && <RenderComponent proposal={proposal} />}</div>
      <VStack gap={6}></VStack>
    </HStack>
  );
}
