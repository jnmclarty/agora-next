import React, { useContext } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";
import DraftProposalReview from "./DraftProposalReview";
import { Proposal } from "@prisma/client";
import { LinkIcon } from "@heroicons/react/20/solid";
import { ProposalLifecycleDraftContext } from "@/contexts/ProposalLifecycleDraftContext";
import toast from "react-hot-toast";

const staticText = {
  description:
    "Please proofread a preview of your proposal below. If you need to change any of its content, please edit your draft in the previous step.",
};

interface DraftProposalFormSubmitProps {
  proposal: Proposal;
  updateProposal: (proposal: Proposal, updateData: Partial<Proposal>) => void;
}

const DraftProposalFormSubmit: React.FC<DraftProposalFormSubmitProps> = (
  props
) => {
  const { proposalState } = useContext(ProposalLifecycleDraftContext);

  const { proposal, updateProposal } = props;

  const handleCopySponsorsipLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/proposals/sponsor/${proposal.id}`
    );
    toast("Proposal link copied to clipboard!");
  };

  return (
    <div className="bg-gray-fa rounded-2xl ring-1 ring-inset ring-gray-eo">
      <AccordionItem
        value="draft-submit"
        className="w-full rounded-2xl bg-white border border-gray-eo shadow-sm"
      >
        <AccordionTrigger>
          <h2 className="text-2xl font-black">Submit proposal</h2>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-gray-4f px-6 pb-7 max-w-[620px]">
            {staticText.description}
          </p>
          <DraftProposalReview
            proposal={proposal}
            updateProposal={updateProposal}
          />
        </AccordionContent>
      </AccordionItem>
      {proposalState.proposalStatus == "awaiting_sponsor" && (
        <div className="flex flex-col gap-y-2 p-6">
          <p className="text-stone-700">
            {
              "Your proposal is awaiting nick.eth’s sponsorship. Once your sponsor approves, your proposal will be automatically submitted, without needing your input. In the meantime, you can contact your sponsor by copying the link below."
            }
          </p>
          <div className="flex flex-row w-full ring-1 ring-inset ring-stone-200 rounded-xl items-center">
            <div className="flex flex-row flex-grow pl-4 gap-x-12 items-center">
              <div className="flex flex-row gap-x-2">
                <div className="w-6 h-6 bg-black rounded-full"></div>
                <p className="text-stone-900">sponsor</p>
              </div>
              <p className="font-medium text-sm text-stone-700">
                awaiting sponsorship
              </p>
            </div>
            <button
              className="flex flex-row border bg-white border-stone-200 rounded-xl flex-shrink-0 px-6 py-3 gap-x-2 font-medium shadow-sm"
              onClick={() => handleCopySponsorsipLink()}
            >
              <LinkIcon className="w-6 h-6" />
              <p>Copy sponsorship link</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftProposalFormSubmit;
