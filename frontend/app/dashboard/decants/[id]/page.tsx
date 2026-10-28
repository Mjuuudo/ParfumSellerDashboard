"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  CalendarClock,
  CircleMinus,
  History,
  Lock,
  PackageOpen,
  RotateCcw,
  UserRound,
} from "lucide-react";
import BrandAvatar from "../../brands/_components/BrandAvatar";
import { formatPrice } from "../../parfums/_components/parfum";
import {
  consumedMl,
  formatDateTime,
  getBottleStatus,
  remainingPercent,
  type DecantBottle,
  type DecantOperation,
} from "../_components/decantBottle";
import VolumeBar from "../_components/VolumeBar";
import BottleStatusBadge from "../_components/BottleStatusBadge";
import { LoadErrorCard, LoadingCard } from "../../_components/LoadStateCards";
import { useToast } from "../../../_components/Toast";

export default function DecantBottleDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();

  // ── Data from GET /api/bottle/:id ──
  const [bottle, setBottle] = useState<DecantBottle | null>(null);
  const [loading, setLoading] = useState(true); // true → skeleton
  const [loadError, setLoadError] = useState(false); // true → error card with "Try again"
  const [notFound, setNotFound] = useState(false); // true → "Bottle #id not found"
  const [reloadKey, setReloadKey] = useState(0); // +1 → the useEffect below runs again

  useEffect(() => {
    const fetchBottle = async () => {
      try {
        // TODO(you): GET http://localhost:8000/api/bottle/${id} with credentials: "include"
        //  - 401      → toast.info(`You Need To Authenticate Before Proceed !`, `Authentication Required`)
        //               + router.push('/login')
        //  - 404      → setNotFound(true)
        //  - not ok   → toast.error("...") + setLoadError(true)
        //  - ok       → const result: DecantBottle = await res.json();
        //               setBottle(result);   ← 👈 PUT THE DATA HERE
        const data = await fetch(`http://localhost:8000/api/bottle/${id}`, {
          method: "get",
          credentials: "include",
        });

        if (data.status === 401 || data.status === 403) {
          toast.error(`You Need To Authenticate !`, `Authentication Required`);
          router.push('/login');
          return ;
        }

        if ( !data.ok ) {
          toast.error(`Error Happend While Fetching Data`, `Critical Error`);
          return ;
        }

        toast.success(`Product Found Successfully !`, `Success On Fetching Data`);
        setBottle(await data.json());

      } catch {
        toast.error("Could not reach the server.");
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBottle();
  }, [id, reloadKey, router, toast]);

  const retry = () => {
    setLoading(true);
    setLoadError(false);
    setNotFound(false);
    setReloadKey((key) => key + 1);
  };

  // No endpoint for the decant operations yet: the Activity list stays empty until there is one.
  const operations: DecantOperation[] = [];

  if (loading || loadError || notFound || !bottle) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <BackLink />
        {loading ? (
          <LoadingCard label="Loading bottle information..." />
        ) : loadError ? (
          <LoadErrorCard what="this bottle" onRetry={retry} />
        ) : (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h1 className="text-xl font-semibold">Bottle #{id} not found</h1>
            <p className="mt-2 text-sm text-slate-400">
              It may have been removed, or the link is wrong.
            </p>
          </section>
        )}
      </div>
    );
  }

  const status = getBottleStatus(bottle);
  const consumed = consumedMl(bottle);
  const percent = remainingPercent(bottle);
  const batch = bottle.stockBatch;
  const parfum = batch.parfum;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <BackLink />

      {/* Header */}
      <section className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:flex-row sm:items-center sm:p-8">
        <BrandAvatar name={parfum.brand.name} image={null} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-widest text-amber-400">BOTTLE #{bottle.id}</p>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">{parfum.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {parfum.brand.name} · {bottle.initialVolumeMl} ml original bottle
          </p>
        </div>
        <BottleStatusBadge status={status} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Volume */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 lg:col-span-2">
          <h2 className="text-lg font-semibold">Perfume Volume</h2>

          <div className="mt-6 flex items-end justify-between gap-4">
            <p>
              <span className="text-4xl font-bold tabular-nums">{bottle.remainingVolumeMl}</span>
              <span className="ml-1 text-lg text-slate-400">ml left</span>
            </p>
            <p className="text-sm tabular-nums text-slate-400">{percent}% remaining</p>
          </div>
          <div className="mt-3">
            <VolumeBar remainingMl={bottle.remainingVolumeMl} initialMl={bottle.initialVolumeMl} size="lg" />
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            <VolumeStat label="Initial" value={bottle.initialVolumeMl} hint="When opened" />
            <VolumeStat label="Consumed" value={consumed} hint="Sold as decants" accent="text-amber-400" />
            <VolumeStat label="Remaining" value={bottle.remainingVolumeMl} hint="Still in bottle" accent="text-emerald-400" />
          </dl>

          {/* The volume relationship, spelled out */}
          <p className="mt-5 rounded-lg border border-dashed border-slate-700 px-4 py-3 text-center text-sm text-slate-400">
            Consumed = Initial − Remaining →{" "}
            <span className="font-medium tabular-nums text-slate-200">
              {bottle.initialVolumeMl} − {bottle.remainingVolumeMl} = {consumed} ml
            </span>
          </p>

          <p className="mt-4 text-xs text-slate-500">
            Enough for about{" "}
            <span className="text-slate-300">{Math.floor(bottle.remainingVolumeMl / 10)} × 10 ml</span> or{" "}
            <span className="text-slate-300">{Math.floor(bottle.remainingVolumeMl / 20)} × 20 ml</span> decants
            <span className="text-slate-600"> (calculated, not stored)</span>.
          </p>
        </section>

        {/* Side column */}
        <div className="space-y-6">
          {/* Source batch */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Boxes size={18} className="text-amber-400" />
              Purchase Batch
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow label="Batch" value={`#${bottle.stockBatchId}`} />
              <InfoRow label="Received by" value={batch.receivedByUser.username} />
              <InfoRow label="Bottles in batch" value={batch.quantity} />
              <InfoRow label="Still sealed" value={batch.unusedQuantity} />
              <InfoRow label="Cost per bottle" value={formatPrice(batch.purchaseCostPerBottle)} />
              <InfoRow
                label="Cost per ml"
                value={`${(batch.purchaseCostPerBottle / bottle.initialVolumeMl).toFixed(1)} MAD`}
                hint="calculated"
              />
            </dl>
          </section>

          {/* Reservation */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Lock size={18} className="text-sky-400" />
              Reservation
            </h2>
            {bottle.reservedById !== null ? (
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Reserved by" value={`User #${bottle.reservedById}`} />
                {bottle.reservedAt && <InfoRow label="Since" value={formatDateTime(bottle.reservedAt)} />}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Not reserved. Any employee can decant from it.</p>
            )}
            <p className="mt-4 rounded-lg bg-slate-950 px-3 py-2 text-xs text-slate-500">
              Design decision pending: what a reservation means (only that employee may decant? just a
              &ldquo;working on it&rdquo; flag?) isn&apos;t decided yet.
            </p>
          </section>

          {/* Dates */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarClock size={18} className="text-amber-400" />
              Dates
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <InfoRow label="Opened" value={formatDateTime(bottle.createdAt)} />
              <InfoRow label="Last decant" value={bottle.lastDecantedAt ? formatDateTime(bottle.lastDecantedAt) : "Never"} />
              <InfoRow label="Last change" value={formatDateTime(bottle.updatedAt)} />
            </dl>
          </section>
        </div>
      </div>

      {/* Activity */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <History size={18} className="text-amber-400" />
            Activity
          </h2>
        </div>

        {operations.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No decant sold from this bottle yet. Each 10 ml or 20 ml decant will appear here.
          </p>
        )}

        <ol className="mt-6 space-y-0">
          {operations.map((op) => (
            <ActivityItem key={op.id} op={op} />
          ))}
          {/* The opening itself is not a DecantOpperation: it comes from createdAt */}
          <li className="relative flex gap-4 pb-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
              <PackageOpen size={15} />
            </span>
            <div className="pt-1">
              <p className="text-sm">
                <span className="font-medium text-slate-100">Bottle opened</span>{" "}
                <span className="text-slate-400">· {bottle.initialVolumeMl} ml from batch #{bottle.stockBatchId}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(bottle.createdAt)}</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/dashboard/decants"
      className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-400"
    >
      <ArrowLeft size={17} />
      Back to Decant Bottles
    </Link>
  );
}

function VolumeStat({ label, value, hint, accent }: { label: string; value: number; hint: string; accent?: string }) {
  return (
    <div className="rounded-xl bg-slate-950 px-3 py-3 text-center sm:px-4">
      <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className={`mt-1 text-xl font-semibold tabular-nums ${accent ?? "text-slate-100"}`}>{value} ml</dd>
      <dd className="mt-0.5 hidden text-[11px] text-slate-600 sm:block">{hint}</dd>
    </div>
  );
}

function InfoRow({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-100">
        {value}
        {hint && <span className="ml-1 text-xs font-normal text-slate-600">({hint})</span>}
      </dd>
    </div>
  );
}

function ActivityItem({ op }: { op: DecantOperation }) {
  const isReversal = op.oppType === "REVERSAL";

  return (
    <li className="relative flex gap-4 pb-6">
      {/* timeline line */}
      <span className="absolute left-4 top-8 -ml-px h-[calc(100%-2rem)] w-px bg-slate-800" aria-hidden="true" />
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isReversal ? "bg-sky-500/15 text-sky-400" : "bg-slate-800 text-slate-300"
        }`}
      >
        {isReversal ? <RotateCcw size={15} /> : <CircleMinus size={15} />}
      </span>
      <div className="pt-1">
        <p className="text-sm">
          {isReversal ? (
            <>
              <span className="font-medium text-sky-300">+{op.quantityMl} ml returned</span>{" "}
              <span className="text-slate-400">
                · order #{op.orderId} cancelled (reverses operation #{op.reversedOperationId})
              </span>
            </>
          ) : (
            <>
              <span className="font-medium text-slate-100">−{op.quantityMl} ml decanted</span>{" "}
              <span className="text-slate-400">· order #{op.orderId}</span>
            </>
          )}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          {formatDateTime(op.performedAt)}
          {op.employee && (
            <>
              <span>·</span>
              <UserRound size={12} />
              {op.employee.firstName} {op.employee.lastName}
            </>
          )}
        </p>
      </div>
    </li>
  );
}
