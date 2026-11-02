import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet2 } from 'lucide-react'
import { SeoTitle } from '@/components/SeoTitle'
import { ErrorState } from '@/components/ErrorState'
import { StepProgress } from '@/features/onboarding/components/StepProgress'
import { WelcomeStep } from '@/features/onboarding/components/WelcomeStep'
import { MoneyStep } from '@/features/onboarding/components/MoneyStep'
import { AreasStep } from '@/features/onboarding/components/AreasStep'
import { PreferencesStep } from '@/features/onboarding/components/PreferencesStep'
import { GeneratingStep } from '@/features/onboarding/components/GeneratingStep'
import { availableCards } from '@/features/onboarding/cards'
import { useOnboardingStore, TOTAL_STEPS } from '@/store/onboardingStore'
import { useSessionStore } from '@/store/sessionStore'
import { useCompleteOnboarding } from '@/hooks/useMe'
import { isMockMode } from '@/lib/env'

/** The demo shortcut fills Arjun's profile from the brief. */
const demoDraft = {
  salary: 40000,
  savingsGoal: 8000,
  homeAreaId: 'area_hsr',
  officeAreaId: 'area_bellandur',
  techParkId: 'park_orbit',
  foodPreference: 'veg' as const,
  cards: availableCards.filter((c) =>
    ['card_hdfc_cc', 'card_sbi_dc', 'card_icici_cc', 'card_axis_dc'].includes(c.id),
  ),
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { step, draft, next, back, patch, setStep, reset } = useOnboardingStore()
  const setOnboarded = useSessionStore((s) => s.setOnboarded)
  const onboarding = useCompleteOnboarding()

  // Users who already finished signup should not see this page again.
  const onboarded = useSessionStore((s) => s.onboarded)
  useEffect(() => {
    if (onboarded) navigate('/', { replace: true })
  }, [onboarded, navigate])

  const submit = (values: typeof draft) => {
    if (
      values.salary === null ||
      values.savingsGoal === null ||
      values.foodPreference === null
    ) {
      return
    }
    onboarding.mutate(
      {
        salary: values.salary,
        savingsGoal: values.savingsGoal,
        homeAreaId: values.homeAreaId,
        officeAreaId: values.officeAreaId,
        techParkId: values.techParkId,
        foodPreference: values.foodPreference,
        cards: values.cards,
      },
      {
        onSuccess: () => {
          setOnboarded(true)
          reset()
          navigate('/', { replace: true })
        },
      },
    )
  }

  const useDemo = () => {
    patch(demoDraft)
    setStep(TOTAL_STEPS)
    submit({ ...draft, ...demoDraft })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <SeoTitle title="Get started" description="Set up your BachelorBuddy budget." />

      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet2 className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">BachelorBuddy</span>
        </div>

        {step < TOTAL_STEPS ? <StepProgress step={step} /> : null}

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {onboarding.isError ? (
            <div className="space-y-4">
              <ErrorState
                error={onboarding.error}
                title="We could not create your budget"
                onRetry={() => submit(draft)}
              />
              <button
                type="button"
                onClick={() => setStep(TOTAL_STEPS - 1)}
                className="w-full text-sm text-muted-foreground underline underline-offset-4"
              >
                Go back and check your details
              </button>
            </div>
          ) : step === 0 ? (
            <WelcomeStep onNext={next} onUseDemo={isMockMode() ? useDemo : undefined} />
          ) : step === 1 ? (
            <MoneyStep
              defaultValues={{
                salary: draft.salary ?? undefined,
                savingsGoal: draft.savingsGoal ?? undefined,
              }}
              onBack={back}
              onSubmit={(values) => {
                patch(values)
                next()
              }}
            />
          ) : step === 2 ? (
            <AreasStep
              defaultValues={{
                homeAreaId: draft.homeAreaId,
                officeAreaId: draft.officeAreaId,
                techParkId: draft.techParkId,
              }}
              onBack={back}
              onSubmit={(values) => {
                patch(values)
                next()
              }}
            />
          ) : step === 3 ? (
            <PreferencesStep
              defaultValues={{
                foodPreference: draft.foodPreference ?? undefined,
                cardIds: draft.cards.map((c) => c.id),
              }}
              submitting={onboarding.isPending}
              onBack={back}
              onSubmit={(values) => {
                const cards = availableCards.filter((c) => values.cardIds.includes(c.id))
                const merged = { ...draft, foodPreference: values.foodPreference, cards }
                patch(merged)
                setStep(TOTAL_STEPS)
                submit(merged)
              }}
            />
          ) : (
            <GeneratingStep done={onboarding.isSuccess} />
          )}
        </div>
      </div>
    </div>
  )
}
